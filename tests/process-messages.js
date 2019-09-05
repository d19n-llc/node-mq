const _ = require("lodash");
const processQueuedMessages = require("../services/queue");
const MessageQueuedResourceClass = require("../resources/message-queued");
const { asyncForLoop } = require("../helpers/functions");

module.exports = async (params = {}) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: { topic: "internal-test" }
		});
		if (findError) throw new Error(findError);

		const data = _.get(findResult, "data");

		if (data.length > 0) {
			await asyncForLoop({ total: data.length, incrementBy: 25 }, async () => {
				const [processError] = await processQueuedMessages({
					removeBuffer: true
				});
				if (processError) throw new Error(processError);
			});
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
