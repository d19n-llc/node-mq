const inflightRollBack = require("../rollback/inflight-batch-failed");
const InFlightResourceClass = require("../../resources/message-inflight");
const FailedResourceClass = require("../../resources/message-failed");

module.exports = async ({ message, batchId, errorMessage }) => {
	const InFlightResource = new InFlightResourceClass();
	const FailedResource = new FailedResourceClass();
	try {
		// Move the message that caused an error to failed
		const [failError] = await FailedResource.createOne({
			object: Object.assign({}, message, {
				error: { message: errorMessage }
			})
		});
		console.log("CLEAN UP", { failError });
		if (failError) throw new Error(failError);
		// Rollback all messages for this batch from inflight to the queue
		const [removeError] = await InFlightResource.deleteOne({
			query: { _id: message._id }
		});
		if (removeError) throw new Error(removeError);
		// Rolback jobs unprocessed into the queue
		const [rollbackError] = await inflightRollBack({ batchId });
		console.log("CLEAN UP", { rollbackError });
		if (rollbackError) throw new Error(rollbackError);
		return [undefined, { status: "messages inflight clean up complete." }];
	} catch (error) {
		return [error, undefined];
	}
};
