const processQueuedMessages = require("../services/process/queue");
const MessageQueuedResourceClass = require("../resources/message-queued");
const { asyncForLoop } = require("../helpers/functions");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: { topic: "internal-test" }
		});
		if (findError) throw new Error(findError);

		if (findResult.length > 0) {
			await asyncForLoop(
				{ total: findResult.length, incrementBy: 25 },
				async () => {
					const [processError] = await processQueuedMessages({
						removeBuffer: true
					});
					if (processError) throw new Error(processError);
				}
			);
		}
		return [
			undefined,
			{
				status: "process messages test complete",
				totalMessages: findResult.length
			}
		];
	} catch (error) {
		return [error, undefined];
	}
};
