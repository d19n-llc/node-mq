const MessageInflightResourceClass = require("../../resources/message-inflight");
const MessageQueuedResourceClass = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");
/**
 *
 *
 * @param {*} { batchId }
 * @returns
 */
module.exports = async ({ batchId }) => {
	const MessageInflightResource = new MessageInflightResourceClass();
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		const [findError, findResult] = await MessageInflightResource.findMany({
			query: { batchId }
		});
		if (findError) throw new Error(findError);

		const failedMessages = findResult ? findResult[0].data : [];

		if (failedMessages.length > 0) {
			await seriesLoop(failedMessages, async (job, index) => {
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
		console.error(error);
		return [error, undefined];
	}
};
