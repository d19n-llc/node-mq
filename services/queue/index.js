const fs = require("fs");
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

module.exports = async ({ removeBuffer = false }) => {
	console.log("PROCESS MESSAGES IN THE QUEUE");
	const MessageQueuedResource = new MessageQueuedResourceClass();

	console.log({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			topic: {
				$in: [...Object.keys(scriptRegistry), ...["internal-test"]]
			}
		}
	});

	// Using the query.. we want to ensure we have a script to process the topics.
	// before we try to handle them.
	const [queueError, queueMessages] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			topic: {
				$in: [...Object.keys(scriptRegistry), ...["internal-test"]]
			}
		}
	});
	console.log({ queueMessages: queueMessages.length });
	if (queueError) throw new Error(queueError);
	console.log({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			source: process.env.APP_URL
		}
	});

	const [pubMsgError, pubMsgResult] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			source: process.env.APP_URL
		}
	});
	console.log({ pubMsgResult: pubMsgResult.length });
	if (pubMsgError) throw new Error(pubMsgError);

	try {
		// Claim jobs
		if ([...pubMsgResult, ...queueMessages].length > 0) {
			console.log("claiming");
			await claimMessages({
				messages: [...pubMsgResult, ...queueMessages],
				removeBuffer
			});
			console.log("processing");
			await processMessages({
				messages: [...pubMsgResult, ...queueMessages],
				scriptRegistry,
				removeBuffer
			});
		}

		return [
			undefined,
			{
				status: "messages processed",
				totalMessages: [...pubMsgResult, ...queueMessages].length
			}
		];
	} catch (error) {
		console.log({ error });
		return [error, undefined];
	}
};
