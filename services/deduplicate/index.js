const { aggregate, deleteOne } = require("../../resources/mongo-methods");
const { seriesLoop } = require("../../helpers/functions");

module.exports = () => {
	let stepsCompleted = {};
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
					console.log({ err, res });
					duplicates = res;
					stepsCompleted = Object.assign({}, stepsCompleted, {
						checkForDuplicates: "processed the first function"
					});
					return resolve();
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
					console.log({ err, res });
					stepsCompleted = Object.assign({}, stepsCompleted, {
						removeDuplicates: "processed the second function"
					});
					return resolve();
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
				console.log({ doc });
				const name = doc._id.name;
				const duplicatesLen = doc.count.length;
				const duplicatesToRemove = doc.documentIds.slice(0, duplicatesLen - 1);
				console.log({ name, duplicatesToRemove });
				await seriesLoop(duplicatesToRemove, async (duplicate, index) => {
					await removeDuplicate({ id: duplicate._id });
				});
			});
		}

		return { stepsCompleted };
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
