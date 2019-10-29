/* eslint-disable no-await-in-loop */
const handleFailedMessage = require("./clean-up");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const ProcessedResourceClass = require("../../resources/message-processed");
const ProcessMessageTest = require("../../scripts/test/process-a-message");
const PublishMessage = require("../publish/message");
const { utcDate } = require("../../helpers/dates");

/**
 *
 *
 * @param {*} {
 * 	messages,
 * 	nodeId,
 * 	messageHandlers,
 * }
 * @returns
 */
module.exports = async ({ messages, nodeId, messageHandlers }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const ProcessedResource = new ProcessedResourceClass();

	/**
	 * When a message is successfully processed, we want to remove it from
	 * inflight and move it to processed.
	 *
	 */
	async function handleProcessedMessage({ message }) {
		const [moveError] = await ProcessedResource.createOneNonIdempotent({
			object: Object.assign({}, message, {
				status: "processed",
				processedAt: utcDate()
			})
		});

}
		// Move message to processed
		const [deleteError] = await MessageQueuedResource.deleteOne({
			query: { _id: message._id }
		});

		if (moveErro || deleteError) {
			await handleFailedMessage({
				message,
				errorMessage: deleteError ? deleteError.message : ""
			});
		}
	}

	try {
		// process jobs
		for (let index = 0; index < messages.length; index++) {
			const message = messages[index];
			const currentMessage = Object.assign({}, message, { nodeId });

			const { source, topic } = message;
			// Test processing works.
			if (source === "test-script") {
				const [error] = await ProcessMessageTest({
					message: currentMessage
				});

				if (error) {
					await handleFailedMessage({
						message: currentMessage,
						errorMessage: error ? error.message : ""
					});
				} else {
					handleProcessedMessage({ message: currentMessage });
				}
			} else if (message.isPublishable) {
				// If the source is the APP_URL that means this message should be published
				// to all subscribers and not processed internally with the script registry.
				const [error] = await PublishMessage({
					message: currentMessage
				});
				if (error) {
					await handleFailedMessage({
						message: currentMessage,
						errorMessage: error ? error.message : ""
					});
				} else {
					handleProcessedMessage({ message: currentMessage });
				}
			} else if (!message.isPublishable && messageHandlers[`${topic}`]) {
				// If the source is not the current APP and their is a script then
				// Use the script with the key === to the message topic
				const [error] = await messageHandlers[`${topic}`]({
					message
				});
				if (error) {
					// eslint-disable-next-line no-await-in-loop
					await handleFailedMessage({
						message: currentMessage,
						errorMessage: error ? error.message : ""
					});
				} else {
					handleProcessedMessage({ message: currentMessage });
				}
			}
		}

		return [
			undefined,
			{ status: "processed messages", total: messages.length }
		];
	} catch (error) {
		console.error("process error", error);
		return [error, undefined];
	}
};
