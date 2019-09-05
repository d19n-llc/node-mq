const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { utcDate, formatDate, setDateInPast } = require("../../helpers/dates");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	const currentDate = formatDate(utcDate(), "YYYY-MM-DD");

	const dateToCheck = formatDate(
		setDateInPast(currentDate, 5, "minutes"),
		"YYYY-MM-DD"
	);

	try {
		// Find the first message that is older than the dateToCheck
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				updatedAt: { $gte: dateToCheck },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});
		if (findError) throw new Error(findError);
		const data = _.get(findResult, "data");

		if (data.length > 0) {
			// Clear the "batchId" to release these messages
			const [updateManyError] = await MessageQueuedResource.updateMany({
				query: { batchId: data[0].batchId },
				object: { batchId: null, status: "queued" }
			});
			if (updateManyError) throw new Error(updateManyError);
		}
		return [undefined, {}];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};