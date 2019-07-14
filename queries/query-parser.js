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

exports.BaseQuery = (params) => {
	const { query } = params;
	const parsedQuery = {
		$match: {}
	};
	const extensions = [];
	const sorts = { $sort: {} };
	const conversionStagePrior = { $addFields: {} };
	const conversionStageAfter = { $addFields: {} };
	const {
		pageNumber = 0,
		resultsPerPage = 35,
		sortAscending,
		sortDescending
	} = query;
	const strippedQuery = { ...query };
	delete strippedQuery.pageNumber;
	delete strippedQuery.resultsPerPage;
	const skip = pageNumber * resultsPerPage;
	const limit = resultsPerPage;
	extensions.push({ $skip: parseInt(skip, 10) });
	extensions.push({ $limit: parseInt(limit, 10) });
	if (sortAscending) {
		sorts.$sort[query.sortAscending] = 1;
		delete strippedQuery.sortAscending;
	}
	if (sortDescending) {
		sorts.$sort[query.sortDescending] = -1;
		delete strippedQuery.sortAscending;
	}
	// if we have added any sorting functionality, push it into the pipeline
	if (Object.keys(sorts.$sort).length) {
		extensions.push(sorts);
	}
	const numberOrDateKeys = ["$gte", "$gt", "$lt", "$lte"];
	const arrayOperators = ["$nin", "$in"];
	Object.keys(strippedQuery).forEach((key) => {
		let currentElement = strippedQuery[key];
		if (!distinctAllowedKeys.includes(key)) {
			throw new Error(`passing in unallowed query field: ${key}`);
		}
		// array of inner keys, if strippedQuery.key was in fact a string this will end up being an array looking
		const innerKeys =
			typeof currentElement === "object" ? Object.keys(currentElement) : [];
		// filter the currentObjects keys, returning only those keys that are present in the number or date keys array : ["$gte", "$gt", "$lt", "$lte"]
		const activeNumberOrDateKeys = numberOrDateKeys.filter((numKey) =>
			innerKeys.includes(numKey)
		);
		const activeArrayKeys = arrayOperators.filter((key) =>
			innerKeys.includes(key)
		);

		const hasNumberOrDateKey = !!activeNumberOrDateKeys.length;
		const hasArrayKey = !!activeArrayKeys.length;

		console.log({ hasArrayKey });
		if (hasArrayKey) {
			// for dates and numbers we need to search on the converted key rather than the original
			parsedQuery["$match"] = {
				...parsedQuery["$match"],
				[key]: { ...currentElement }
			};
			console.log({ parsedQuery: parsedQuery["$match"] });
		}
		// if we are using fields like gte or lt, we need to convert this to string before we can use gte or lt operator.
		if (hasNumberOrDateKey) {
			// take the first value of the number or date key fields, this should allow you to deduce whether it is a date, or number
			const sampleNumberOrDateKey = activeNumberOrDateKeys[0];
			// numbers often pass moment date validation - instead we create date object and convert it back, if it was a proper date it should match the original
			const isDate =
				moment(currentElement[sampleNumberOrDateKey], "YYYY-MM-DD").format(
					"YYYY-MM-DD"
				) === currentElement[sampleNumberOrDateKey];
			// convert to number or date depending on type

			if (isDate) {
				conversionStagePrior.$addFields[`${key}Converted`] = {
					$dateFromString: {
						dateString: `$${key}`,
						onError: `$${key}`
					}
				};
				// swap all valuues in the current element to be dates - ie {$gte: "100", $lt: "120"} becomes {$gte: 100, $lt: 120}
				activeNumberOrDateKeys.forEach((relevantDateKey) => {
					currentElement[relevantDateKey] = new Date(
						currentElement[relevantDateKey]
					);
				});
			} else {
				conversionStagePrior.$addFields[`${key}Converted`] = {
					$toDouble: `$${key}`
				};
				// swap all valuues in the current element to be integers - ie {$gte: "100", $lt: "120"} becomes {$gte: 100, $lt: 120}
				activeNumberOrDateKeys.forEach((relevantNumberKey) => {
					currentElement[relevantNumberKey] = parseInt(
						currentElement[relevantNumberKey],
						10
					);
				});
			}
			// for dates and numbers we need to search on the converted key rather than the original
			parsedQuery["$match"] = {
				...parsedQuery["$match"],
				[`${key}Converted`]: { ...currentElement }
				// [key]: { $ne: "" }
			};
			// is not a date or number type field
		} else {
			const hasRegexKey =
				typeof currentElement === "object" ? !!currentElement.$regex : false;
			if (hasRegexKey) {
				currentElement = {
					$regex: currentElement.$regex.trim(),
					$options: "i"
				};
			}
			parsedQuery["$match"] = {
				...parsedQuery["$match"],
				[key]: currentElement
			};
		}
	});

	const queryPipeline = [parsedQuery, ...extensions];
	// if there is a prior conversion to be performed, add it to the beginning of the pipeline
	if (Object.keys(conversionStagePrior.$addFields).length) {
		queryPipeline.unshift(conversionStagePrior);
	}
	// if there is a post conversion to be performed, add it to the end of the pipeline
	if (Object.keys(conversionStageAfter.$addFields).length) {
		queryPipeline.push(conversionStageAfter);
	}

	return { queryPipeline };
};
