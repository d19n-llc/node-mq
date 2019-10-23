const _ = require("lodash");

const NodeResourceClass = require("../../resources/node");
const { utcDate, setDateInPast } = require("../../helpers/dates");

module.exports = async (params = {}) => {
	const NodeResource = new NodeResourceClass();

	const dateToCheck = setDateInPast(utcDate(), 1, "minutes");
	console.log("unhealthy nodes", { dateToCheck });

	try {
		// Find the first message that is older than the dateToCheck
		const [findError, findResult] = await NodeResource.findMany({
			query: {
				updatedAtConverted: { $lte: new Date(dateToCheck) },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});

		if (findError) throw new Error(findError);
		const data = _.get(findResult, "data");

		if (data.length > 0) {
			// Delete unhealthy node
			const [updateError] = await NodeResource.deleteOne({
				query: { nodeId: data[0].nodeId }
			});
			if (updateError) throw new Error(updateError);
		}
		return [undefined, {}];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
