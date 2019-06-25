const { aggregate, deleteOne } = require("../../resources/mongo-methods");
const { seriesLoop } = require("../../helpers/functions");

module.exports = () => {
	let duplicates = [];
	/**
	 *
	 *
	 * @returns
	 */
	function checkForDuplicates() {
		return new Promise((resolve, reject) => {
			// custom logic here
			aggregate(
				{
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
				},
				(err, res) => {
					if (err) return reject(err);
					duplicates = res;
					return resolve(res);
				}
			);
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function removeDuplicate(params) {
		const { id } = params;
		return new Promise((resolve, reject) => {
			// custom logic here
			deleteOne(
				{
					collName: "mq_messages_queued",
					query: { _id: id }
				},
				(err, res) => {
					if (err) return reject(err);
					return resolve(res);
				}
			);
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		await checkForDuplicates();
		if (duplicates.length > 0) {
			await seriesLoop(duplicates, async (doc, index) => {
				const duplicatesLen = doc.count.length;
				const duplicatesToRemove = doc.documentIds.slice(0, duplicatesLen - 1);
				await seriesLoop(duplicatesToRemove, async (duplicate, index) => {
					await removeDuplicate({ id: duplicate._id });
				});
			});
		}

		return { duplicates };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			console.log(err);
		});
};
