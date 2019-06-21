const messageInflight = require("../../resources/message-inflight");
const messageQueued = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");

module.exports = (params) => {
	const { batchId } = params;
	console.log("rollback job queue", { batchId });
	const stepsCompleted = {};
	let jobsInflight = [];
	/**
	 *
	 *
	 * @returns
	 */
	function findInFlightJobs() {
		return new Promise((resolve, reject) => {
			// custom logic here
			messageInflight.findMany(
				{
					query: { batchId }
				},
				(err, res) => {
					jobsInflight = res;
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
	function moveJobToQueue(fnParams) {
		const { job } = fnParams;
		return new Promise((resolve, reject) => {
			messageQueued.createOne(
				{
					body: Object.assign({}, job, { batchId: "" })
				},
				(err, res) => {
					if (err) {
						return reject(err);
					}
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
		// Uncomment to use a database connection
		await findInFlightJobs();
		if (jobsInflight.length > 0) {
			await seriesLoop(jobsInflight, async (doc, index) => {
				await moveJobToQueue({ job: doc });
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
