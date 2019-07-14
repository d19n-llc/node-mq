const MessageQueuedResourceClass = require("../../resources/message-queued");
const InFlightResourceClass = require("../../resources/message-inflight");
const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const handleCleanUpOnError = require("./clean-up");

module.exports = async ({ messages, batchId, removeBuffer }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const InFlightResource = new InFlightResourceClass();

	let currentMessage = {};

	try {
		await seriesLoop(messages, async (message) => {
			currentMessage = Object.assign({}, message, { batchId });
			console.log({ currentMessage });
			console.log("CLAIMING MESSAGES", {
				pastBuffer: isPastQueueBuffer({
					messageCreatedAt: message.createTime
				}),
				messages: messages.length
			});
			if (
				isPastQueueBuffer({ messageCreatedAt: currentMessage.createTime }) ||
				removeBuffer
			) {
				console.log("PAST QUEUE, CLAIM MESSAGES");

				console.log("REMOVE FROM QUEUE");
				const [removeError] = await MessageQueuedResource.deleteOne({
					query: { _id: currentMessage._id }
				});
				if (removeError) {
					await handleCleanUpOnError({
						currentMessage,
						batchId: currentMessage.batchId,
						errorMessage: removeError.message
					});
				}
				console.log("MOVE TO INFLIGHT");
				const [inflightError] = await InFlightResource.createOne({
					object: currentMessage
				});
				if (inflightError) {
					await handleCleanUpOnError({
						currentMessage,
						batchId: currentMessage.batchId,
						errorMessage: inflightError.message
					});
				}
			}
		});
		return [undefined, { status: "messages claimed", total: messages.length }];
	} catch (error) {
		return [error, undefined];
	}
};
