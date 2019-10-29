const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const FailedResourceClass = require("../../resources/message-failed");

module.exports = async ({ message, errorMessage }) => {
	const FailedResource = new FailedResourceClass();
	const MessageQueueResource = new MessageQueuedResourceClass();
	const editedMessage = _.omit(message, ["_id"]);
	try {
		// Move the message that caused an error to failed
		const [failError] = await FailedResource.createOneNonIdempotent({
			object: Object.assign({}, editedMessage, {
				status: "failed",
				error: { message: errorMessage }
			})
		});

		if (failError) throw new Error(failError);

		// Delete the message from the queue
		const [deleteError, deleteResult] = await MessageQueueResource.deleteOne({
			query: { _id: message._id }
		});

		if (deleteError) throw new Error(deleteError);

		return [
			undefined,
			{
				status: "messages inflight clean up complete.",
				modifiedCount: _.get(deleteResult, "modifiedCount"),
				upsertedCount: _.get(deleteResult, "upsertedCount"),
				matchedCount: _.get(deleteResult, "matchedCount")
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
