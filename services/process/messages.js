const uuidv1 = require("uuid/v1");
const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const messageQueue = require("../../resources/message-queued");
const messageInFlight = require("../../resources/message-inflight");
const messageComplete = require("../../resources/message-processed");
const messageFailedPermanent = require("../../resources/message-failed");
const inflightRollBack = require("../../services/rollback/inflight-batch-failed");

const scriptRegistry = require(`${process.cwd()}/mq-scripts`);

console.log({ scriptRegistry });

// Pass in user added scripts for processing custom messages

module.exports = () => {
	const batchId = uuidv1();
	const stepsCompleted = {};
	let jobs = [];
	let currentMessage = {};
	/**
	 *
	 *
	 * @returns
	 */
	function findQueuedMessages() {
		return new Promise((resolve, reject) => {
			// custom logic here
			messageQueue.findMany(
				{
					query: [{ $match: {} }, { $limit: 25 }, { $sort: { priority: -1 } }]
				},
				(err, res) => {
					if (err) {
						return reject(err);
					}
					jobs = res;
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
	function processMessage(params) {
		const { message } = params;
		return new Promise((resolve, reject) => {
			console.log({ message });
			const topic = message.topic;
			console.log("script", scriptRegistry[`${topic}`]);
			scriptRegistry[`${topic}`]({ message }, (err, res) => {
				console.log("processMessage", { err, res });
				if (err) return reject(err);
				return resolve(res);
			});
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function removeFromQueue(params) {
		return new Promise((resolve, reject) => {
			messageQueue.deleteOne({ id: currentMessage._id }, (err, res) => {
				if (err) {
					return reject(err);
				}
				return resolve(res);
			});
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function moveToInflight(params) {
		return new Promise((resolve, reject) => {
			messageInFlight.createOne(
				{
					body: Object.assign({}, currentMessage, { batchId })
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

	/**
	 *
	 *
	 * @returns
	 */
	function removeFromInFlight(params) {
		return new Promise((resolve, reject) => {
			messageInFlight.deleteOne({ id: currentMessage._id }, (err, res) => {
				if (err) {
					return reject(err);
				}
				return resolve(res);
			});
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function moveToComplete(params) {
		return new Promise((resolve, reject) => {
			messageComplete.createOne(
				{
					body: currentMessage
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

	// ************************************************************************** //

	// Handle when a job fails

	// ************************************************************************** //

	/**
	 *
	 *
	 * @returns
	 */
	function permanentlyFail(fnParams) {
		const { err } = fnParams;
		return new Promise((resolve, reject) => {
			messageFailedPermanent.createOne(
				{ body: Object.assign({}, currentMessage, { error: err }) },
				(err, res) => {
					if (err) {
						return reject(err);
					}
					return resolve(res);
				}
			);
		});
	}

	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		// This will process functions in parallel for anything that can be handled asynchronously
		await findQueuedMessages();
		// Claim jobs
		await seriesLoop(jobs, async (job) => {
			if (isPastQueueBuffer({ jobCreatedAt: job.createTime })) {
				currentMessage = job;
				await removeFromQueue();
				await moveToInflight();
			}
		});
		// process jobs
		await seriesLoop(jobs, async (job, index) => {
			currentMessage = job;
			if (isPastQueueBuffer({ jobCreatedAt: job.createTime })) {
				await processMessage({ message: job });
				await removeFromInFlight();
				await moveToComplete();
			}
		});
		return { stepsCompleted };
	}

	/**
	 * Process functions
	 *
	 */
	async function asyncFunctionsOnError(fnParams) {
		const { err } = fnParams;
		// This will process functions in parallel for anything that can be handled asynchronously
		await removeFromInFlight();
		await permanentlyFail({ err });
		// Rolback jobs unprocessed into the queue
		await inflightRollBack({ batchId });
		return { stepsCompleted };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			console.log({ err });
			// Call the async functions for handling errors
			asyncFunctionsOnError({ err })
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log(err);
				});
		});
};
