const inflightRollBack = require("../rollback/inflight-batch-failed");
const InFlightResourceClass = require("../../resources/message-inflight");
const FailedResourceClass = require("../../resources/message-failed");

module.exports = async ({ currentMessage, batchId, errorMessage }) => {
	const InFlightResource = new InFlightResourceClass();
	const FailedResource = new FailedResourceClass();
	console.log("CLEANING ITEMS");
	try {
		// Rollback all messages for this batch from inflight to the queue
		const [removeError] = await InFlightResource.deleteOne({
			query: { _id: currentMessage._id }
		});
		if (removeError) throw new Error(removeError);
		// Move the message that caused an error to failed
		const [failError] = await FailedResource.createOne({
			object: Object.assign({}, currentMessage, {
				error: { message: errorMessage }
			})
		});
		if (failError) throw new Error(failError);
		// Rolback jobs unprocessed into the queue
		const [rollbackError] = await inflightRollBack({ batchId });
		if (rollbackError) throw new Error(rollbackError);
		return [undefined, { status: "messages inflight clean up complete." }];
	} catch (error) {
		return [error, undefined];
	}
};
