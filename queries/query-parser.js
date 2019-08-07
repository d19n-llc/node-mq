const moment = require("moment");
const messageSchema = require("../models/message/schema");
const publisherSchema = require("../models/publisher/schema");
const subscribersSchema = require("../models/subscriber/schema");

function recursiveFindJoiKeys(joi, prefix = "") {
	const keys = [];
	const children = joi && joi._inner && joi._inner.children;
	if (Array.isArray(children)) {
		children.forEach((child) => {
			keys.push(child.key);
			recursiveFindJoiKeys(child.schema, `${child.key}.`).forEach((k) =>
				keys.push(k)
			);
		});
	}
	return keys;
}

const allowedKeys = recursiveFindJoiKeys(messageSchema)
	.concat(recursiveFindJoiKeys(publisherSchema))
	.concat(recursiveFindJoiKeys(subscribersSchema));

const distinctAllowedKeys = [...new Set(allowedKeys)];

class Query {
	constructor({ query, isPaginated = false }) {
		// this is the master object that the individual query stages get put inside
		this.queryPipeline = [];
		const queryCopy = { ...query };
		const { pageNumber = 0, resultsPerPage = 35, sort } = query;
		this.resultsPerPage = resultsPerPage;
		this.isPaginated = isPaginated;
		this.parsedQuery = {
			$match: { deletedAt: null }
		};
		console.log({ queryCopy });
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
			{ $skip: parseInt(skip, 10) },
			{ $limit: parseInt(limit, 10) }
		];
		this.numberOrDateKeys = ["$gte", "$gt", "$lt", "$lte"];
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
						dateString: `$${fieldName}`,
						onError: `$${fieldName}`
					}
				};
				sortStage.$sort[`${fieldName}Converted`] = parseInt(order, 10);
			} else {
				sortStage.$sort[fieldName] = parseInt(order, 10);
			}
			this.extensions.push(sortStage);
		}
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
					dateString: `$${key}`,
					onError: `$${key}`
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
				[key]: queryItemValue
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
				typeof queryItemValue === "object" ? Object.keys(queryItemValue) : [];
			// filter the currentObjects keys, returning only those keys that are present in the number or date keys array : ["$gte", "$gt", "$lt", "$lte"]
			const activeNumberOrDateKeys = this.numberOrDateKeys.filter((numKey) =>
				innerKeys.includes(numKey)
			);
			const hasNumberOrDateKey = !!activeNumberOrDateKeys.length;
			const hasRegexKey =
				typeof queryItemValue === "object" ? !!queryItemValue.$regex : false;
			if (hasNumberOrDateKey) {
				this.handleNumberOrDateKeyQuery({
					key,
					queryItemValue,
					activeNumberOrDateKeys
				});
			} else if (hasRegexKey) {
				this.handleRegexQuery({ key, queryItemValue });
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
		if (this.isPaginated) {
			return {
				queryPipeline: [
					{
						$facet: {
							data: this.queryPipeline,
							metaData: this.paginationPipeline
						}
					}
				]
			};
		}
		console.log({ queryPipeline: this.queryPipeline });
		return { queryPipeline: this.queryPipeline };
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
