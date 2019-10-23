const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { utcDate } = require("../../helpers/dates");

/**
 *
 *
 * @param {*} { messages, nodeId, removeBuffer }
 * @returns
 */
module.exports = async ({ nodeId }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		// Find the first message that does not have a noded
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				nodeId: null,
				resultsPerPage: 1000,
				pageNumber: 0,
				sort: "1|createdAt|"
			}
		});

		if (findError) throw new Error(findError);
		// Get the topic of that message

		const data = _.get(findResult, "data");
		const topic = _.get(data[0], "topic");

		if (topic) {
			// Add the "nodeId" and change the status to "in_flight" which locks the
			// messages with that topic
			const [
				claimError,
				claimResult
				// eslint-disable-next-line no-await-in-loop
			] = await MessageQueuedResource.updateMany({
				query: { topic, nodeId: null },
				object: { nodeId, status: "in_flight" }
			});

			// If there is an error clear the "nodeId" and change the status to "queued"
			if (claimError) {
				// eslint-disable-next-line no-await-in-loop
				const [updateManyError] = await MessageQueuedResource.updateMany({
					query: { nodeId },
					object: { nodeId: null, status: "queued", assignedAt: utcDate() }
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
