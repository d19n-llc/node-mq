const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const handleCleanUpOnError = require("./clean-up");

const InFlightResourceClass = require("../../resources/message-inflight");
const ProcessedResourceClass = require("../../resources/message-processed");
const ProcessMessageTest = require("../../scripts/test/process-a-message");
const SubscriberResourceClass = require("../../resources/subscriber");
const PublishMessage = require("../publish/message");
/**
 *
 *
 * @param {*} {
 * 	messages,
 * 	batchId,
 * 	scriptRegistry,
 * 	removeBuffer
 * }
 * @returns
 */
module.exports = async ({
	messages,
	batchId,
	scriptRegistry,
	removeBuffer
}) => {
	const InFlightResource = new InFlightResourceClass();
	const ProcessedResource = new ProcessedResourceClass();
	const SubscriberResource = new SubscriberResourceClass();

	let currentMessage = {};

	/**
	 * When a message is successfully processed, we want to remove it from
	 * inflight and move it to processed.
	 *
	 */
	async function handleProcessedMessage() {
		// Remove message from inflight
		const [removeError] = await InFlightResource.deleteOne({
			query: { _id: currentMessage._id }
		});
		if (removeError) {
			await handleCleanUpOnError({
				currentMessage,
				batchId,
				errorMessage: removeError
			});
		}
		// Move message to processed
		const [moveError] = await ProcessedResource.createOne({
			object: currentMessage
		});
		if (moveError) {
			await handleCleanUpOnError({
				currentMessage,
				batchId,
				errorMessage: moveError
			});
		}
	}

	try {
		// process jobs
		await seriesLoop(messages, async (message, index) => {
			currentMessage = Object.assign({}, message, { batchId });
			if (
				isPastQueueBuffer({ messageCreatedAt: message.createTime }) ||
				removeBuffer
			) {
				const { source, topic } = message;
				// Test processing works.
				if (source === "test-script") {
					const [error, result] = await ProcessMessageTest({ message });
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					} else {
						handleProcessedMessage();
					}
				} else if (source === process.env.APP_URL) {
					// If the source is the APP_URL that means this message should be published
					// to all subscribers and not processed internally with the script registry.
					const [error, result] = await PublishMessage({ message });
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					} else {
						handleProcessedMessage();
					}
				} else if (
					source !== process.env.APP_URL &&
					scriptRegistry[`${topic}`]
				) {
					// If the source is not the current APP and their is a script then
					// Use the script with the key === to the message topic
					const [error, result] = await scriptRegistry[`${topic}`]({
						message
					});
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					} else {
						handleProcessedMessage();
					}
				}
			}
		});

		return [
			undefined,
			{ status: "processed messages", total: messages.length }
		];
	} catch (error) {
		return [error, undefined];
	}
};
