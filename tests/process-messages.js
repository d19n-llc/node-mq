const processQueuedMessages = require("../services/process/queue");
const messageQueue = require("../resources/message-queued");
const { asyncForLoop } = require("../helpers/functions");

module.exports = (params, callback = () => {}) => {
	let totalMessages = 0;
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
					query: [{ $match: { topic: "internal-test" } }]
				},
				(err, res) => {
					if (err) {
						return reject(err);
					}
					totalMessages = res.length;
					return resolve(res);
				}
			);
		});
	}
	/**
	 * This function will run the message queu processing service
	 *
	 * @returns
	 */
	function processMessagesInQueue() {
		return new Promise((resolve, reject) => {
			processQueuedMessages({ removeBuffer: true }, (err, res) => {
				if (err) return reject(err);
				return resolve(res);
			});
		});
	}
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		await findQueuedMessages();
		await asyncForLoop(
			{ total: totalMessages, incrementBy: 25 },
			async (doc, index) => {
				await processMessagesInQueue();
			}
		);
		return { status: "process messages test complete", totalMessages };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((res) => {
			return callback(undefined, res);
		})
		.catch((err) => {
			return callback(err, undefined);
		});
};
