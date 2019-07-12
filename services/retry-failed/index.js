const FailedResourceClass = require("../../resources/message-failed");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const FailedResource = new FailedResourceClass();

	try {
		const [findError, findResult] = await FailedResource.findMany({
			query: { maxRetries: { $gt: 0 } }
		});

		if (findError) throw new Error(findResult);
		const messages = findResult.filter(
			(elem) => elem.maxRetries > elem.retriedCount
		);

		if (messages.length > 0) {
			await seriesLoop(messages, async (message, index) => {
				const [
					createError,
					createResult
				] = await MessageQueuedResource.createOne({
					body: Object.assign({}, message, {
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
		return [undefined, messages];
	} catch (error) {
		console.log({ path: process.cwd(), error });
		return [error, undefined];
	}
};
