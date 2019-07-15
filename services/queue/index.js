const fs = require("fs");
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
	const pathToScripts = `${process.cwd()}/mq-scripts`;
	console.log({ pathToScripts });
	let scriptRegistry = {};
	console.log(fs.existsSync(pathToScripts));
	try {
		scriptRegistry = require(`${process.cwd()}/mq-scripts`);
		console.log({ scriptRegistry1: scriptRegistry });
	} catch (err) {
		// set to default
		scriptRegistry = {};
		console.error(err);
	}
	console.log({ scriptRegistry });

	const MessageQueuedResource = new MessageQueuedResourceClass();
	// Set a batchId for the messages being processed
	const batchId = uuidv1();
	console.log({
		topic: {
			$in: [...Object.keys(scriptRegistry), ...["internal-test"]]
		}
	});
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
	console.log({ queueMessages });
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
			const [claimError, claimResult] = await claimMessages({
				messages: [...pubMsgResult, ...queueMessages],
				batchId,
				removeBuffer
			});
			if (claimError) throw new Error(claimError);
			console.log({ claimResult });
			// Process messages claimed
			const [processError, processResult] = await processMessages({
				messages: [...pubMsgResult, ...queueMessages],
				batchId,
				scriptRegistry,
				removeBuffer
			});
			if (processError) throw new Error(processError);
			console.log({ processResult });
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
