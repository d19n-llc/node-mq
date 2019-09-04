const _ = require("lodash");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const FailedResourceClass = require("../../resources/message-failed");

module.exports = async ({ message, errorMessage }) => {
	const FailedResource = new FailedResourceClass();
	const MessageQueueResource = new MessageQueuedResourceClass();
	try {
		// Move the message that caused an error to failed
		const [failError] = await FailedResource.createOne({
			object: Object.assign({}, message, {
				status: "failed",
				error: { message: errorMessage }
			})
		});

		if (failError) throw new Error(failError);

		const [deleteError, updateResult] = await MessageQueueResource.deleteOne({
			query: { _id: message._id }
		});

		if (deleteError) throw new Error(deleteError);

		return [
			undefined,
			{
				status: "messages inflight clean up complete.",
				modifiedCount: _.get(updateResult, "modifiedCount"),
				upsertedCount: _.get(updateResult, "upsertedCount"),
				matchedCount: _.get(updateResult, "matchedCount")
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
