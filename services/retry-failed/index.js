// Check for jobs failed with a retryCount < retriedCount
// If they have a retry count > 0 move it back to the message queue and increment
// the retriedCount by 1.
// Repeat this process until the retriedCount is tried the max number of times.
const messageFailed = require("../../resources/message-failed");
const messageQueued = require("../../resources/message-queued");
const { seriesLoop } = require("../../helpers/functions");

module.exports = (params, callback = () => {}) => {
	let messages = [];
	/**
	 *
	 *
	 * @returns
	 */
	function findFailedMessagesToRetry() {
		return new Promise((resolve, reject) => {
			// custom logic here
			messageFailed.findMany(
				{
					query: [{ $match: { maxRetries: { $gt: 0 } } }]
				},
				(err, res) => {
					messages = res.filter((elem) => elem.maxRetries > elem.retriedCount);
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
	function moveMessageToQueue({ message }) {
		return new Promise((resolve, reject) => {
			console.log({
				body: Object.assign({}, message, {
					batchId: "",
					retriedCount: message.retriedCount + 1
				})
			});
			messageQueued.createOne(
				{
					body: Object.assign({}, message, {
						batchId: "",
						retriedCount: message.retriedCount + 1
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
	 *
	 *
	 * @returns
	 */
	function removeMessageFromFailed({ message }) {
		return new Promise((resolve, reject) => {
			messageFailed.deleteOne({ id: message._id }, (err, res) => {
				if (err) {
					return reject(err);
				}
				return resolve(res);
			});
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		// Uncomment to use a database connection
		await findFailedMessagesToRetry();
		console.log({ messages: messages.length });
		if (messages.length > 0) {
			await seriesLoop(messages, async (doc, index) => {
				console.log({ index });
				await moveMessageToQueue({ message: doc });
				await removeMessageFromFailed({ message: doc });
			});
		}

		return {
			status: "failed jobs moved back to queue",
			messages: messages.length
		};
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			return callback(undefined, result);
		})
		.catch((err) => {
			console.log(err);
			return callback(err, undefined);
		});
};
