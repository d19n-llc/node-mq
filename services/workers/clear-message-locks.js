const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { utcDate, setDateInPast } = require("../../helpers/dates");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	const dateToCheck = setDateInPast(utcDate(), 2, "minutes");

	try {
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				updatedAtConverted: { $lte: new Date(dateToCheck) },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});

		const data = _.get(findResult, "data");

		if (data.length > 0) {
			// Clear the "nodeId" to release these messages
			const [updateManyError] = await MessageQueuedResource.updateMany({
				query: { nodeId: data[0].nodeId },
				object: { nodeId: null, status: "queued" }
			});
			if (updateManyError) throw new Error(updateManyError);
		}
		return [undefined, {}];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
