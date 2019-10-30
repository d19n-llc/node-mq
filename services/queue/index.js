const os = require("os");
const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const processMessages = require("./process");
const { utcDate } = require("../../helpers/dates");

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
	// const batchId = uuidv1();
	const dockerId = os.hostname;
	const appInstanceId = process.env.INSTANCE_ID || 0;
	const nodeId = `${dockerId}-${appInstanceId}`;

	// Handle messages
	try {
		const [queueError, queueMessages] = await MessageQueuedResource.findMany({
			query: {
				resultsPerPage: queueSettings.batchCount
					? 1000 // limit per batch
					: queueSettings.batchCount || 1000,
				sort: "1|createdAtConverted|",
				nodeId,
				status: "in_flight",
				topic: {
					$in: [...Object.keys(messageHandlers), ...["internal-test"]]
				}
			}
		});

		if (queueError) throw new Error(queueError);

		const [updateManyError] = await MessageQueuedResource.updateMany({
			query: { nodeId },
			object: { status: "locked" }
		});

		if (updateManyError) throw new Error(updateManyError);

		// Get the data from both categories of messages
		const messagesToProcess = _.get(queueMessages, "data");
		console.log("messagesToProcess.length", messagesToProcess.length);
		// Check that we have messages before processing
		if ([...messagesToProcess].length > 0) {
			// Process messages claimed
			const [processError, processResult] = await processMessages({
				messages: [...messagesToProcess],
				nodeId,
				messageHandlers
			});
			console.log({ processError, processResult });
			if (processError) throw new Error(processError);
		}
		return [
			undefined,
			{
				status: "messages processed",
				totalMessages: [...messagesToProcess].length
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
