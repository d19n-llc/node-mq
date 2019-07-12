const MessageQueuedResourceClass = require("../resources/message-queued");
const MessageInflightResourceClass = require("../resources/message-inflight");
const MessageFailedResourceClass = require("../resources/message-failed");
const MessageProcessedResourceClass = require("../resources/message-processed");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const MessageInflightResource = new MessageInflightResourceClass();
	const MessageFailedResource = new MessageFailedResourceClass();
	const MessageProcessedResource = new MessageProcessedResourceClass();

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */

	try {
		const [queueError, queueResult] = await MessageQueuedResource.deleteMany({
			query: { topic: "internal-test" }
		});
		if (queueError) throw new Error(queueError);

		const [
			failedError,
			failedResult
		] = await MessageInflightResource.deleteMany({
			query: { topic: "internal-test" }
		});
		if (failedError) throw new Error(failedError);

		const [
			inflightError,
			inflightResult
		] = await MessageFailedResource.deleteMany({
			query: { topic: "internal-test" }
		});
		if (inflightError) throw new Error(inflightError);

		const [
			processedError,
			processedResult
		] = await MessageProcessedResource.deleteMany({
			query: { topic: "internal-test" }
		});
		if (processedError) throw new Error(processedError);

		const result = {
			queueResult,
			failedResult,
			inflightResult,
			processedResult
		};

		return [undefined, result];
	} catch (error) {
		return [error, undefined];
	}
};
