const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const handleCleanUpOnError = require("./clean-up");

const InFlightResourceClass = require("../../resources/message-inflight");
const ProcessedResourceClass = require("../../resources/message-processed");
const ProcessMessageTest = require("../../scripts/test/process-a-message");
const PublishMessage = require("../publish/message");

/**
 *
 *
 * @param {*} { messages, removeBuffer }
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
	let currentMessage = {};

	try {
		// process jobs
		await seriesLoop(messages, async (message, index) => {
			console.log("PROCESSING MESSAGS", {
				pastBuffer: isPastQueueBuffer({
					messageCreatedAt: message.createTime
				}),
				messages: messages.length
			});
			currentMessage = message;
			if (
				isPastQueueBuffer({ messageCreatedAt: message.createTime }) ||
				removeBuffer
			) {
				console.log("Processing message passed Queue Buffer");
				const { source, topic } = message;
				console.log({ source, topic });
				// Test processing works.
				if (source === "test-script") {
					const [error, result] = await ProcessMessageTest({ message });
					console.log({ error, result });
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					}
				}
				// If the source is the APP_URL that means this message should be published
				// to all subscribers.
				console.log({ source, APP_URL: process.env.APP_URL });
				if (source === process.env.APP_URL) {
					console.log(process.cwd(), "publish message");
					const [error, result] = await PublishMessage({ message });
					console.log({ error, result });
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					}
				}

				// Handle messages
				if (scriptRegistry && Object.keys(scriptRegistry).length > 0) {
					// Use the script with the key === to the message topic
					const [error, result] = await scriptRegistry[`${topic}`]({
						message
					});
					console.log({ error });
					if (error) {
						await handleCleanUpOnError({
							currentMessage,
							batchId,
							errorMessage: error
						});
					}
				}

				console.log("Remove from inflight");
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
				console.log("Move to processed");
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
		});
		return [
			undefined,
			{ status: "processed messages", total: messages.length }
		];
	} catch (error) {
		return [error, undefined];
	}
};
