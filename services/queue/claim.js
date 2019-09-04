const MessageQueuedResourceClass = require("../../resources/message-queued");
const InFlightResourceClass = require("../../resources/message-inflight");
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
		for (let index = 0; index < messages.length; index++) {
			const message = messages[index];
			const currentMessage = Object.assign({}, message, { batchId });
			if (
				isPastQueueBuffer({ messageCreatedAt: currentMessage.createTime }) ||
				removeBuffer
			) {
				// Move to inflight
				// eslint-disable-next-line no-await-in-loop
				const [
					inflightError,
					inflightResult
				] = await InFlightResource.createOne({
					object: currentMessage
				});
				if (inflightError) {
					// eslint-disable-next-line no-await-in-loop
					await handleCleanUpOnError({
						message: currentMessage,
						batchId: currentMessage.batchId,
						errorMessage: inflightError.message
					});
				}
				// If we have the result then delete the message from the queue
				if (inflightResult) {
					// Remove from the queue
					// eslint-disable-next-line no-await-in-loop
					const [removeError] = await MessageQueuedResource.deleteOne({
						query: { _id: currentMessage._id }
					});
					if (removeError) {
						// eslint-disable-next-line no-await-in-loop
						await handleCleanUpOnError({
							message: currentMessage,
							batchId: currentMessage.batchId,
							errorMessage: removeError.message
						});
					}
				}
			}
		}
		return [undefined, { status: "messages claimed", total: messages.length }];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
