const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");

/**
 *
 *
 * @param {*} { messages, batchId, removeBuffer }
 * @returns
 */
module.exports = async ({ batchId }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		// Find the first message that does not have a batchId
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				batchId: null,
				resultsPerPage: 1,
				pageNumber: 0
			}
		});

		if (findError) throw new Error(findError);
		// Get the topic of that message

		const data = _.get(findResult, "data");
		const topic = _.get(data[0], "topic");

		if (topic) {
			// Add the "batchId" and change the status to "in_flight" which locks the
			// messages with that topic
			const [
				claimError,
				claimResult
				// eslint-disable-next-line no-await-in-loop
			] = await MessageQueuedResource.updateMany({
				query: { topic, batchId: null },
				object: { batchId, status: "in_flight" }
			});

			// If there is an error clear the "batchId" and change the status to "queued"
			if (claimError) {
				// eslint-disable-next-line no-await-in-loop
				const [updateManyError] = await MessageQueuedResource.updateMany({
					query: { batchId },
					object: { batchId: null, status: "queued" }
				});
				if (updateManyError) throw new Error(updateManyError);
			}

			return [
				undefined,
				{
					status: "messages claimed",
					modifiedCount: _.get(claimResult, "modifiedCount"),
					upsertedCount: _.get(claimResult, "upsertedCount"),
					matchedCount: _.get(claimResult, "matchedCount")
				}
			];
		}
		return [
			undefined,
			{
				status: "no messages to claim",
				modifiedCount: 0,
				upsertedCount: 0,
				matchedCount: 0
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
