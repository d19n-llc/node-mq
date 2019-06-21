const uuidv1 = require("uuid/v1");
const fs = require("fs");
const { seriesLoop } = require("../../helpers/functions");
const { isPastQueueBuffer } = require("../../helpers/processing");
const messageQueue = require("../../resources/message-queued");
const messageInFlight = require("../../resources/message-inflight");
const messageComplete = require("../../resources/message-processed");
const messageFailedPermanent = require("../../resources/message-failed");
const inflightRollBack = require("../rollback/inflight-batch-failed");
const { ProcessMessageTest } = require("../../scripts/test/process-a-message");

const pathToScripts = `${process.cwd()}/mq-scripts`;
let scriptRegistry = null;
try {
	console.log("script registry exists", fs.existsSync(pathToScripts));
	if (fs.existsSync(pathToScripts)) {
		scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	}
} catch (err) {
	console.error(err);
}

console.log({ scriptRegistry });

// Pass in user added scripts for processing custom messages

module.exports = ({ removeBuffer = false }, callback) => {
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
	function processMessage({ message }) {
		return new Promise((resolve, reject) => {
			const topic = message.topic;
			if (topic === "internal-test") {
				console.log({ topic });
				ProcessMessageTest({ message }, (err, res) => {
					console.log("processMessage", { err, res });
					if (err) return reject(err);
					return resolve(res);
				});
			}
			if (scriptRegistry) {
				console.log("script", scriptRegistry[`${topic}`]);
				// Use the script with the key === to the message topic
				scriptRegistry[`${topic}`]({ message }, (err, res) => {
					console.log("processMessage", { err, res });
					if (err) return reject(err);
					return resolve(res);
				});
			}
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function removeFromQueue() {
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
	function moveToInflight() {
		return new Promise((resolve, reject) => {
			currentMessage = Object.assign({}, currentMessage, { batchId });
			messageInFlight.createOne(
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

	/**
	 *
	 *
	 * @returns
	 */
	function removeFromInFlight() {
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
	function moveToComplete() {
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
	function permanentlyFail({ error }) {
		return new Promise((resolve, reject) => {
			console.log("permanentlyFail", { currentMessage });
			messageFailedPermanent.createOne(
				{
					body: Object.assign({}, currentMessage, {
						error: { message: error.message }
					})
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
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		// This will process functions in parallel for anything that can be handled asynchronously
		await findQueuedMessages();
		// Claim jobs
		await seriesLoop(jobs, async (job) => {
			if (isPastQueueBuffer({ jobCreatedAt: job.createTime }) || removeBuffer) {
				console.log({ removeBuffer });
				currentMessage = job;
				await removeFromQueue();
				await moveToInflight();
			}
		});
		// process jobs
		await seriesLoop(jobs, async (job, index) => {
			currentMessage = job;
			if (isPastQueueBuffer({ jobCreatedAt: job.createTime }) || removeBuffer) {
				console.log({ removeBuffer });
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
		await permanentlyFail({ error: err });
		// Rolback jobs unprocessed into the queue
		await inflightRollBack({ batchId });
		return { stepsCompleted };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			return callback(undefined, result);
		})
		.catch((err) => {
			console.log({ err });
			// Call the async functions for handling errors
			asyncFunctionsOnError({ err })
				.then((res) => {
					console.log(res);
					return callback(undefined, res);
				})
				.catch((err) => {
					console.log(err);
					return callback(err, undefined);
				});
		});
};
