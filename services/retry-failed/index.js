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
		const [findError, findResult] = await FailedResource.findMany({
			query: { maxRetries: { $gt: 0 } }
		});

		if (findError) throw new Error(findResult);
		const failedMessages = findResult ? findResult[0].data : [];

		if (failedMessages.length > 0) {
			const messages = failedMessages.filter(
				(elem) => elem.maxRetries > elem.retriedCount
			);
			await seriesLoop(messages, async (message, index) => {
				const [
					createError,
					createResult
				] = await MessageQueuedResource.createOne({
					object: Object.assign({}, message, {
						batchId: "",
						retriedCount: message.retriedCount + 1
					})
				});

				if (createError) throw new Error(createError);

				const [failedError, failedResult] = await FailedResource.deleteOne({
					query: { _id: message._id }
				});
				if (failedError) throw new Error(failedError);
			});
		}
		return [undefined, { failedMessages: failedMessages.length }];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
