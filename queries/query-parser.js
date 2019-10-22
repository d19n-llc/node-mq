const moment = require("moment");
const messageSchema = require("../models/message/schema");
const nodeSchema = require("../models/node/schema");
const publisherSchema = require("../models/publisher/schema");
const subscribersSchema = require("../models/subscriber/schema");

function recursiveFindJoiKeys(joi) {
	const keys = [];
	const children = joi && joi._inner && joi._inner.children;

	if (Array.isArray(children)) {
		children.forEach((child) => {
			keys.push(child.key);

			if (child.schema["_inner"].matches) {
				// Has a Joi > if > then validatory
				if (child.schema["_inner"].matches[0]) {
					// If there is an array and it has items this gets the items from the
					// then statement
					if (child.schema["_inner"].matches[0]["then"]["_inner"]["items"]) {
						child.schema["_inner"].matches[0]["then"]["_inner"]["items"].map(
							(elem) =>
								elem["_inner"].children.forEach((item) =>
									keys.push(`${child.key}.${item.key}`)
								)
						);
					}
				}
			}

			recursiveFindJoiKeys(child.schema).forEach((k) =>
				keys.push(`${child.key}.${k}`)
			);
		});
	}

	return keys;
}

const allowedKeys = recursiveFindJoiKeys(messageSchema)
	.concat(recursiveFindJoiKeys(publisherSchema))
	.concat(recursiveFindJoiKeys(nodeSchema))
	.concat(recursiveFindJoiKeys(subscribersSchema));

const distinctAllowedKeys = [...new Set(allowedKeys)];

class Query {
	constructor({ query, queryExtension, isPaginated = false }) {
		// this is the master object that the individual query stages get put inside
		this.queryPipeline = [];
		const queryCopy = { ...query };
		const { pageNumber = 0, resultsPerPage = 100, sort } = query;
		this.resultsPerPage = resultsPerPage;
		this.isPaginated = isPaginated;
		this.parsedQuery = {
			$match: { deletedAt: null }
		};
		// We need to remove the facet stage if it has one
		// and set the facet as a separate object.
		this.queryExtensionFacet = queryExtension
			? queryExtension.find((elem) => elem["$facet"])
			: undefined;
		this.queryExtensionNoFacet = queryExtension
			? queryExtension.filter((elem) => !!elem["$facet"] !== true)
			: [];
		const skip = pageNumber * resultsPerPage;
		const limit = resultsPerPage;
		// we will remove some unique fields like pageNumber, results, and sort from the query. We create a copy beforehand so we are not altering the original param.
		const strippedQuery = queryCopy;
		// delete these as they need to be handled seperately rather than inside the parsed query
		delete strippedQuery.pageNumber;
		delete strippedQuery.resultsPerPage;
		if (strippedQuery.sort) delete strippedQuery.sort;
		this.strippedQuery = strippedQuery;
		// store sort in class variable to be accessed later
		this.sortQueryRaw = sort;
		// this will be inserted at the beginning of the queryPipeline, it is only used for pre-query conversions
		this.conversionStageAfter = { $addFields: {} };
		// this will be inserted at the end of the queryPipeline, it is only used for post-query conversions
		this.conversionStagePrior = { $addFields: {} };

		this.extensions = [
			skip ? { $skip: parseInt(skip, 10) } : undefined,
			limit ? { $limit: parseInt(limit, 10) } : undefined
		].filter(Boolean);

		this.numberOrDateOperators = ["$gte", "$gt", "$lt", "$lte", "$eq"];
		this.arrayOperators = ["$in"];
		this.universalOperators = ["bool"];
	}

	validate() {
		const strippedQueryKeys = Object.keys(this.strippedQuery);
		for (let i = 0; i < strippedQueryKeys.length; i += 1) {
			const key = strippedQueryKeys[i];
			if (!distinctAllowedKeys.includes(key)) {
				throw new Error(`passing in unallowed query field: ${key}`);
			}
		}
	}

	buildSortQuery() {
		if (this.sortQueryRaw) {
			const sortStage = { $sort: {} };
			const [order, fieldName, conversion] = this.sortQueryRaw.split("|");
			if (conversion) {
				this.conversionStagePrior.$addFields[`${fieldName}Converted`] = {
					$dateFromString: {
						dateString: `$${fieldName}`
						// onError: `$${fieldName}` // MDB version 4.0 or later
					}
				};
				sortStage.$sort[`${fieldName}Converted`] = parseInt(order, 10);
			} else {
				sortStage.$sort[fieldName] = parseInt(order, 10);
			}
			this.extensions.unshift(sortStage);
		}
	}

	handleUniverseOperators({ key, queryItemValue }) {
		if (typeof queryItemValue === "object" ? !!queryItemValue.bool : false) {
			this.parsedQuery["$match"] = {
				...this.parsedQuery["$match"],
				[key]: queryItemValue.bool === "true"
			};
		}
	}

	handleArrayOperators({ key, queryItemValue }) {
		let array = [queryItemValue["$in"]];

		if (typeof queryItemValue["$in"] === "object") {
			array = [queryItemValue["$in"].join(",")];
			array = array[0].split(",");
		}

		if (queryItemValue["$in"].includes(",")) {
			array = queryItemValue["$in"].split(",");
			array = array.map((elem) => elem.trim());
		}

		this.parsedQuery["$match"] = {
			...this.parsedQuery["$match"],
			[key]: { $in: array }
		};
	}

	handleRegexQuery({ key, queryItemValue }) {
		const convertedQueryItemValue = {
			$regex: queryItemValue.$regex.trim(),
			$options: "i"
		};

		this.parsedQuery["$match"] = {
			...this.parsedQuery["$match"],
			[key]: convertedQueryItemValue
		};
	}

	handleDefaultQuery({ key, queryItemValue }) {
		this.parsedQuery["$match"] = {
			...this.parsedQuery["$match"],
			[key]: queryItemValue
		};
	}

	// eslint-disable-next-line class-methods-use-this
	handleNumberOrDateKeyQuery({ key, queryItemValue, activeNumberOrDateKeys }) {
		// take the first value of the number or date key fields, this should allow you to deduce whether it is a date, or number
		const operatorKey = activeNumberOrDateKeys[0];
		// numbers often pass moment date validation - instead we create date object and convert it back, if it was a proper date it should match the original

		const isDate =
			moment(queryItemValue[operatorKey], "YYYY-MM-DD").format("YYYY-MM-DD") ===
			queryItemValue[operatorKey];

		// convert to number or date depending on type
		if (isDate) {
			this.conversionStagePrior.$addFields[`${key}Converted`] = {
				$dateFromString: {
					dateString: `$${key}`
					// onError: `$${key}` // MDB version 4.0 or later
				}
			};

			// swap all valuues in the current element to be dates - ie {$gte: "100", $lt: "120"} becomes {$gte: 100, $lt: 120}
			activeNumberOrDateKeys.forEach((relevantDateKey) => {
				queryItemValue[relevantDateKey] = new Date(
					queryItemValue[relevantDateKey]
				);
			});

			// for dates and numbers we need to search on the converted key rather than the original
			this.parsedQuery["$match"] = {
				...this.parsedQuery["$match"],
				[`${key}Converted`]: { ...queryItemValue }
			};

			// presumably this is a number instead of a date, since we are storing numbers as number types we do not need to convert it or do anything special
		} else {
			this.parsedQuery["$match"] = {
				...this.parsedQuery["$match"],
				[key]: { [operatorKey]: parseInt(queryItemValue[operatorKey], 10) }
			};
		}
	}

	buildParsedQueryStage() {
		const strippedQueryKeys = Object.keys(this.strippedQuery);
		// stripped querys would look similar to:	{name: {"$regex": "mart"}, programId: "3232121", budget: {"$gt": 2000}}
		for (let i = 0; i < strippedQueryKeys.length; i += 1) {
			const key = strippedQueryKeys[i];

			const queryItemValue = this.strippedQuery[key];
			// array of inner keys, if strippedQuery.key was in fact a string this will end up being an array looking
			const innerKeys =
				queryItemValue && typeof queryItemValue === "object"
					? Object.keys(queryItemValue)
					: [];
			// filter the currentObjects keys, returning only those keys that are present in the number or date keys array : ["$gte", "$gt", "$lt", "$lte"]
			const activeNumberOrDateKeys = this.numberOrDateOperators.filter(
				(operator) => innerKeys.includes(operator)
			);
			const includesArrayOperators = this.arrayOperators.filter((operator) =>
				innerKeys.includes(operator)
			);
			const hasNumberOrDateKey = !!activeNumberOrDateKeys.length;
			const hasRegexKey =
				queryItemValue && typeof queryItemValue === "object"
					? !!queryItemValue.$regex
					: false;
			const includesUniversalOperators = this.universalOperators.filter(
				(operator) => innerKeys.includes(operator)
			);

			// handle data formatting for query to have the correct data type
			if (hasNumberOrDateKey) {
				this.handleNumberOrDateKeyQuery({
					key,
					queryItemValue,
					activeNumberOrDateKeys
				});
			} else if (hasRegexKey) {
				this.handleRegexQuery({ key, queryItemValue });
			} else if (
				includesUniversalOperators &&
				includesUniversalOperators.length > 0
			) {
				this.handleUniverseOperators({ key, queryItemValue });
			} else if (includesArrayOperators && includesArrayOperators.length > 0) {
				this.handleArrayOperators({ key, queryItemValue });
			} else {
				this.handleDefaultQuery({ key, queryItemValue });
			}
		}
	}

	buildQueryPipeline() {
		this.queryPipeline = [this.parsedQuery, ...this.extensions];

		// if there is a prior conversion to be performed, add it to the beginning of the pipeline
		if (Object.keys(this.conversionStagePrior.$addFields).length) {
			this.queryPipeline.unshift(this.conversionStagePrior);
		}
		// if there is a post conversion to be performed, add it to the end of the pipeline
		if (Object.keys(this.conversionStageAfter.$addFields).length) {
			this.queryPipeline.push(this.conversionStageAfter);
		}
	}

	buildPaginationPipeline() {
		// pagination data needs to be limited by the same query field, insert parsed query before count etc.
		this.paginationPipeline = [
			this.parsedQuery,
			{
				$count: "count"
			},
			{
				$project: {
					count: 1,
					totalPages: {
						$divide: ["$count", parseInt(this.resultsPerPage, 10)]
					}
				}
			},
			{
				$project: {
					count: 1,
					totalPages: { $ceil: "$totalPages" }
				}
			}
		];
		// add the conversion stage ($addFields) to the paginationData peice as well so we have an accurate count
		if (Object.keys(this.conversionStagePrior.$addFields).length) {
			this.paginationPipeline.unshift(this.conversionStagePrior);
		}
	}

	getFinalQuery() {
		// Handle queries with pagination
		if (this.isPaginated) {
			// Handle queries with a $facet aggregation in the query
			if (this.queryExtensionFacet) {
				return {
					queryPipeline: [
						...this.queryExtensionNoFacet,
						...this.queryPipeline,
						{
							$facet: {
								...this.queryExtensionFacet["$facet"],
								metaData: this.paginationPipeline
							}
						}
					]
				};
			}
			// Handle queries with out a $facet aggregation in the query
			return {
				queryPipeline: [
					...this.queryExtensionNoFacet,
					{
						$facet: {
							data: this.queryPipeline,
							metaData: this.paginationPipeline
						}
					}
				]
			};
		}
		// Handle queries with no pagination
		// Handle queries with a $facet aggregation in the query
		if (this.queryExtensionFacet) {
			return {
				queryPipeline: [
					...this.queryExtensionNoFacet,
					...this.queryPipeline,
					{
						$facet: {
							...this.queryExtensionFacet["$facet"]
						}
					}
				]
			};
		}
		// Handle queries with no pagination
		// Handle queries with a $facet aggregation in the query
		return {
			queryPipeline: [
				...this.queryExtensionNoFacet,
				{
					$facet: {
						data: this.queryPipeline
					}
				}
			]
		};
	}

	processAndReturnQuery() {
		this.validate();
		this.buildSortQuery();
		this.buildParsedQueryStage();
		this.buildQueryPipeline();
		if (this.isPaginated) {
			this.buildPaginationPipeline();
		}

		return this.getFinalQuery();
	}
}

module.exports = {
	Query
};
