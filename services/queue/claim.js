const _ = require("lodash");

const MessageQueuedResourceClass = require("../../resources/message-queued");

/**
 *
 *
 * @param {*} { messages, batchId, removeBuffer }
 * @returns
 */
module.exports = async ({ batchId }) => {
	const MessageQueuedResource = new MessageQueuedResourceClass();

	try {
		console.log({ batchId });

		const [findError, findResult] = await MessageQueuedResource.findMany({
			query: {
				batchId: { $in: [null, ""] },
				resultsPerPage: 1,
				pageNumber: 0
			}
		});

		if (findError) throw new Error(findError);

		console.log({ findError, findResult });
		const data = _.get(findResult[0], "data");
		const topic = _.get(data[0], "topic");

		if (topic) {
			const [
				claimError,
				claimResult
				// eslint-disable-next-line no-await-in-loop
			] = await MessageQueuedResource.updateMany({
				query: { topic, batchId: { $in: [null, ""] } },
				object: { batchId, status: "in_flight" }
			});

			// If there is an error remove the batchId and change the status to Queued
			if (claimError) {
				// eslint-disable-next-line no-await-in-loop
				const [
					updateManyError,
					updateManyResult
					// eslint-disable-next-line no-await-in-loop
				] = await MessageQueuedResource.updateMany({
					query: { batchId },
					object: { batchId: null, status: "queued" }
				});
				if (updateManyError) throw new Error(updateManyError);
			}

			return [
				undefined,
				{
					status: "messages claimed",
					modifiedCount: _.get(claimResult, "modifiedCount"),
					upsertedCount: _.get(claimResult, "upsertedCount"),
					matchedCount: _.get(claimResult, "matchedCount")
				}
			];
		}
		return [
			undefined,
			{
				status: "Nothing to claim",
				modifiedCount: 0,
				upsertedCount: 0,
				matchedCount: 0
			}
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
