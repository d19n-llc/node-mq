const retryFailedMessages = require("../services/retry-failed/index");

module.exports = (params, callback = () => {}) => {
	/**
	 * This function will run the message queu processing service
	 *
	 * @returns
	 */
	function processFailedMessages() {
		return new Promise((resolve, reject) => {
			retryFailedMessages({ removeBuffer: true }, (err, res) => {
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
		const res = await processFailedMessages();
		console.log("failed message res", { res });
		return { status: "retry failed messages test complete" };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((res) => {
			return callback(undefined, res);
		})
		.catch((err) => {
			console.log(err);
			return callback(err, undefined);
		});
};
