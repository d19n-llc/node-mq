const MessageInflightResourceClass = require("../../resources/message-inflight");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");

module.exports = async (params = {}) => {
	const { batchId } = params;
	const MessageInflightResource = new MessageInflightResourceClass();
	const MessageQueuedResource = new MessageQueuedResourceClass();

	console.log("ROLLING BACK MESSAGES FROM INFLIGHT");

	try {
		const [findError, findResult] = await MessageInflightResource.findMany({
			query: { batchId }
		});
		if (findError) throw new Error(findError);

		if (findResult.length > 0) {
			await seriesLoop(findResult, async (job, index) => {
				const [
					createError,
					createResult
				] = await MessageQueuedResource.createOne({
					object: Object.assign({}, job, { batchId: "" })
				});
				if (createError) throw new Error(createError);
			});

			const [
				deleteError,
				deleteResult
			] = await MessageInflightResource.deleteMany({
				query: { batchId }
			});
			if (deleteError) throw new Error(deleteError);
		}
		return [undefined, { batchCount: findResult.length }];
	} catch (error) {
		return [error, undefined];
	}
};
