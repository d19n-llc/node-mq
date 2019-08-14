const uuidv1 = require("uuid/v1");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const claimMessages = require("./claim");
const processMessages = require("./process");
/**
 *
 *
 * @param {*} { removeBuffer = false }
 * @returns
 */
module.exports = async ({ removeBuffer = false }) => {
	// Load the queue scripts
	let messageHandlers = {};
	try {
		const config = require(`${process.cwd()}/mq-config`);
		messageHandlers = config.messageHandlers;
	} catch (err) {
		// set to default
		messageHandlers = {};
		// console.error(err);
	}

	const MessageQueuedResource = new MessageQueuedResourceClass();
	// Set a batchId for the messages being processed
	const batchId = uuidv1();
	// Messages to be processed
	const [queueError, queueMessages] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 50,
			sort: "1|priority|",
			topic: {
				$in: [...Object.keys(messageHandlers), ...["internal-test"]]
			}
		}
	});

	if (queueError) throw new Error(queueError);

	// Messages to be published out to subscribers
	const [pubMsgError, pubMsgResult] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 50,
			sort: "1|priority|",
			source: process.env.APP_URL
		}
	});

	if (pubMsgError) throw new Error(pubMsgError);

	// Handle messages
	try {
		if ([...pubMsgResult[0].data, ...queueMessages[0].data].length > 0) {
			// Claim messages to be processed
			const [claimError, claimResult] = await claimMessages({
				messages: [...pubMsgResult[0].data, ...queueMessages[0].data],
				batchId,
				removeBuffer
			});
			console.log("QUEUE INDEX", { claimError });
			if (claimError) throw new Error(claimError);
			// Process messages claimed
			const [processError, processResult] = await processMessages({
				messages: [...pubMsgResult[0].data, ...queueMessages[0].data],
				batchId,
				messageHandlers,
				removeBuffer
			});
			console.log("QUEUE INDEX", { processError });
			if (processError) throw new Error(processError);
		}
		return [
			undefined,
			{
				status: "messages processed",
				totalMessages: [...pubMsgResult[0].data, ...queueMessages[0].data]
					.length
			}
		];
	} catch (error) {
		return [error, undefined];
	}
};
