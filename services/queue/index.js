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
	let queueSettings = {};
	try {
		const config = require(`${process.cwd()}/mq-config`);
		messageHandlers = config.messageHandlers;
		queueSettings = config.queueSettings;
	} catch (err) {
		// set to default
		messageHandlers = {};
		// console.error(err);
	}
	const MessageQueuedResource = new MessageQueuedResourceClass();

	// Set a batchId for the messages being processed
	const batchId = uuidv1();

	// Handle messages
	try {
		// if ([...pubMsgResult[0].data, ...queueMessages[0].data].length > 0) {
		// Claim messages to be processed
		const [claimError, claimResult] = await claimMessages({
			// messages: [...pubMsgResult[0].data, ...queueMessages[0].data],
			batchId,
			removeBuffer
		});
		if (claimError) throw new Error(claimError);

		const [queueError, queueMessages] = await MessageQueuedResource.findMany({
			query: {
				resultsPerPage: queueSettings.batchCount || 250,
				sort: "1|createdAt|",
				batchId,
				topic: {
					$in: [...Object.keys(messageHandlers), ...["internal-test"]]
				}
			}
		});

		if (queueError) throw new Error(queueError);

		// Messages to be published out to subscribers
		const [pubMsgError, pubMsgResult] = await MessageQueuedResource.findMany({
			query: {
				resultsPerPage: queueSettings.batchCount || 250,
				batchId,
				sort: "1|createdAt|",
				source: process.env.APP_URL
			}
		});

		if (pubMsgError) throw new Error(pubMsgError);

		if ([...pubMsgResult[0].data, ...queueMessages[0].data].length > 0) {
			// Process messages claimed
			const [processError, processResult] = await processMessages({
				messages: [...pubMsgResult[0].data, ...queueMessages[0].data],
				batchId,
				messageHandlers,
				removeBuffer
			});

			if (processError) throw new Error(processError);
		}
		return [
			undefined,
			{
				status: "messages processed",
				totalMessages: 100
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
