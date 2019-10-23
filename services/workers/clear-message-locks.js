const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { utcDate, formatDate, setDateInPast } = require("../../helpers/dates");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	const currentDate = formatDate(utcDate(), "YYYY-MM-DD");

	const dateToCheck = setDateInPast(currentDate, 1, "minutes");

	try {
		const [findGtError, findGtResult] = await MessageQueuedResource.findMany({
			query: {
				updatedAtConverted: { $gte: new Date(dateToCheck) },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});
		console.log({ findGtResult });
		// Find the first message that is older than the dateToCheck
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				updatedAtConverted: { $lte: new Date(dateToCheck) },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});

		console.log({ findResult });

		if (findError) throw new Error(findError);
		const data = _.get(findResult, "data");
		console.log({ data });
		if (data.length > 0) {
			// Clear the "nodeId" to release these messages
			const [updateManyError] = await MessageQueuedResource.updateMany({
				query: { nodeId: data[0].nodeId },
				object: { nodeId: null, status: "queued" }
			});
			console.log({ updateManyError });
			if (updateManyError) throw new Error(updateManyError);
		}
		return [undefined, {}];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
