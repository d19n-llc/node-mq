const { aggregate, deleteOne } = require("../../resources/mongo-methods");
const { seriesLoop } = require("../../helpers/functions");

module.exports = async (params = {}) => {
	try {
		const [findError, findResult] = await aggregate({
			collName: "mq_messages_queued",
			query: [
				{
					$group: {
						_id: { name: "$name" },
						documentIds: { $push: { _id: "$_id" } },
						count: { $sum: 1 }
					}
				},
				{
					$match: {
						count: { $gt: 1 }
					}
				},
				{
					$sort: {
						count: -1
					}
				}
			]
		});
		if (findError) return [findError, undefined];

		if (findResult.length > 0) {
			await seriesLoop(findResult, async (doc, index) => {
				const duplicateLen = doc.count.length;

				if (duplicateLen > 1) {
					const duplicatesToRemove = doc.documentIds.slice(0, duplicateLen - 1);
					await seriesLoop(duplicatesToRemove, async (duplicate, index) => {
						const [removeError] = await deleteOne({
							collName: "mq_messages_queued",
							query: { _id: duplicate._id }
						});
						if (removeError) throw new Error(removeError);
					});
				}
			});
		}
		return [undefined, {}];
	} catch (error) {
		return [error, undefined];
	}
};
