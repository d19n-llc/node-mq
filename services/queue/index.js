const fs = require("fs");
const uuidv1 = require("uuid/v1");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const claimMessages = require("./claim");
const processMessages = require("./process");

// Load the queue scripts
const pathToScripts = `${process.cwd()}/mq-scripts`;
let scriptRegistry = {};
try {
	if (fs.existsSync(pathToScripts)) {
		scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	}
} catch (err) {
	console.error(err);
}
/**
 *
 *
 * @param {*} { removeBuffer = false }
 * @returns
 */
module.exports = async ({ removeBuffer = false }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	// Set a batchId for the messages being processed
	const batchId = uuidv1();

	// Messages to be processed
	const [queueError, queueMessages] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			topic: {
				$in: [...Object.keys(scriptRegistry), ...["internal-test"]]
			}
		}
	});
	if (queueError) throw new Error(queueError);

	// Messages to be published out to subscribers
	const [pubMsgError, pubMsgResult] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			source: process.env.APP_URL
		}
	});
	if (pubMsgError) throw new Error(pubMsgError);

	// Handle messages
	try {
		if ([...pubMsgResult, ...queueMessages].length > 0) {
			// Claim messages to be processed
			const [claimError] = await claimMessages({
				messages: [...pubMsgResult, ...queueMessages],
				batchId,
				removeBuffer
			});
			if (claimError) throw new Error(claimError);
			// Process messages claimed
			const [processError] = await processMessages({
				messages: [...pubMsgResult, ...queueMessages],
				batchId,
				scriptRegistry,
				removeBuffer
			});
			if (processError) throw new Error(processError);
		}
		return [
			undefined,
			{
				status: "messages processed",
				totalMessages: [...pubMsgResult, ...queueMessages].length
			}
		];
	} catch (error) {
		return [error, undefined];
	}
};
