const uuidv1 = require("uuid/v1");
const fs = require("fs");
const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const InFlightResourceClass = require("../../resources/message-inflight");
const FailedResourceClass = require("../../resources/message-failed");
const ProcessedResourceClass = require("../../resources/message-processed");
const inflightRollBack = require("../rollback/inflight-batch-failed");
const ProcessMessageTest = require("../../scripts/test/process-a-message");
const PublishMessage = require("../../services/publish/message");

const pathToScripts = `${process.cwd()}/mq-scripts`;
let scriptRegistry = {};
try {
	if (fs.existsSync(pathToScripts)) {
		scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	}
} catch (err) {
	console.error(err);
}

// Pass in user added scripts for processing custom messages

module.exports = async ({ removeBuffer = false }) => {
	const batchId = uuidv1();
	let currentMessage = {};
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const InFlightResource = new InFlightResourceClass();
	const FailedResource = new FailedResourceClass();
	const ProcessedResource = new ProcessedResourceClass();

	/**
	 *
	 *
	 * @returns
	 */
	async function processMessage({ message }) {
		const { source, topic } = message;
		// If the source is self that means this message has been published
		// to the queue and should be sent to subscribers.
		if (source === process.env.APP_URL) {
			const [error, result] = await PublishMessage({ message });
			return [error, result];
		}

		if (topic === "internal-test") {
			const [error, result] = await ProcessMessageTest({ message });
			return [error, result];
		}
		if (scriptRegistry) {
			// Use the script with the key === to the message topic
			const [error, result] = await scriptRegistry[`${topic}`]({ message });
			return [error, result];
		}
	}

	/**
	 * Clean up queue on error
	 *
	 * @param {*} { error }
	 * @returns
	 */
	async function handleCleanUpOnError({ error }) {
		// Rollback all messages for this batch from inflight to the queue
		const [removeError] = await InFlightResource.deleteOne({
			id: currentMessage._id
		});
		if (removeError) throw new Error(removeError);
		// Move the message that caused an error to failed
		const [failError] = await FailedResource.createOne({
			object: Object.assign({}, currentMessage, {
				error: { message: error.message }
			})
		});
		if (failError) throw new Error(failError);
		// Rolback jobs unprocessed into the queue
		const [rollbackError] = await inflightRollBack({ batchId });
		if (rollbackError) return [rollbackError, undefined];
		return [undefined, { status: "messages inflight clean up complete." }];
	}

	// Using the query.. we want to ensure we have a script to process the topics.
	// before we try to handle them.
	const [queueError, queueMessages] = await MessageQueuedResource.findMany({
		query: {
			resultsPerPage: 100,
			sortAscending: "priority",
			topic: {
				$in: [
					...Object.keys(scriptRegistry),
					...[process.env.APP_URL, "internal-test"]
				]
			}
		}
	});
	if (queueError) return [queueError, undefined];
	// Claim jobs
	if (queueMessages.length > 0) {
		await seriesLoop(queueMessages, async (message) => {
			if (
				isPastQueueBuffer({ messageCreatedAt: message.createTime }) ||
				removeBuffer
			) {
				currentMessage = message;
				const [removeError] = await MessageQueuedResource.deleteOne({
					id: currentMessage._id
				});
				if (removeError) {
					handleCleanUpOnError({ error: removeError });
				}
				const [inflightError] = await InFlightResource.createOne({
					object: currentMessage
				});
				if (inflightError) {
					handleCleanUpOnError({ error: inflightError });
				}
			}
		});
		// process jobs
		await seriesLoop(queueMessages, async (message, index) => {
			currentMessage = message;
			if (
				isPastQueueBuffer({ messageCreatedAt: message.createTime }) ||
				removeBuffer
			) {
				const [processingError] = await processMessage({
					message
				});
				if (processingError) {
					handleCleanUpOnError({ error: processingError });
				}
				const [removeError] = await InFlightResource.deleteOne({
					id: currentMessage._id
				});
				if (removeError) {
					handleCleanUpOnError({ error: removeError });
				}
				const [moveError] = await ProcessedResource.createOne({
					object: currentMessage
				});
				if (moveError) {
					handleCleanUpOnError({ error: moveError });
				}
			}
		});
	}

	return [
		undefined,
		{ status: "messages processed", totalMessages: queueMessages.length }
	];
};
