const MessageQueuedResourceClass = require("../../resources/message-queued");
const InFlightResourceClass = require("../../resources/message-inflight");
const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const handleCleanUpOnError = require("./clean-up");
/**
 *
 *
 * @param {*} { messages, batchId, removeBuffer }
 * @returns
 */
module.exports = async ({ messages, batchId, removeBuffer }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();
	const InFlightResource = new InFlightResourceClass();

	try {
		await seriesLoop(messages, async (message) => {
			const currentMessage = Object.assign({}, message, { batchId });

			if (
				isPastQueueBuffer({ messageCreatedAt: currentMessage.createTime }) ||
				removeBuffer
			) {
				// Remove from the queue
				const [removeError] = await MessageQueuedResource.deleteOne({
					query: { _id: currentMessage._id }
				});
				if (removeError) {
					await handleCleanUpOnError({
						message: currentMessage,
						batchId: currentMessage.batchId,
						errorMessage: removeError.message
					});
				}

				// Move to inflight
				const [inflightError] = await InFlightResource.createOne({
					object: currentMessage
				});
				if (inflightError) {
					await handleCleanUpOnError({
						message: currentMessage,
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
