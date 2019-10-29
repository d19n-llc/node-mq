const _ = require("lodash");
const FailedResourceClass = require("../../resources/message-failed");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");
/**
 *
 *
 * @param {*} [params={}]
 * @returns
 */
module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const FailedResource = new FailedResourceClass();

	try {
		// Find retriable messages
		const [findError, findResult] = await FailedResource.findMany({
			query: { maxRetries: { $gt: 0 } }
		});

		if (findError) throw new Error(findResult);
		// Get the topic of that message

		const data = _.get(findResult, "data");

		if (data && data.length > 0) {
			// Do not process any failed messages that have been retried for the max
			// amount of retries.
			const messages = data.filter(
				(elem) => elem.maxRetries !== elem.retriedCount
			);

			// Create the failed message in the queue to be processed
			await seriesLoop(messages, async (message, index) => {
				const editedMessage = _.omit(message, ["_id"]);

				const [
					createError
				] = await MessageQueuedResource.createOneNonIdempotent({
					object: Object.assign({}, editedMessage, {
						nodeId: null,
						status: "queued",
						retriedCount: message.retriedCount + 1
					})
				});

				if (createError) throw new Error(createError);
				// Delete the message from the failed message collection
				const [failedError] = await FailedResource.deleteOne({
					query: { _id: message._id }
				});
				if (failedError) throw new Error(failedError);
			});
		}
		return [undefined, { failedMessages: data.length }];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
