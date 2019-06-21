const retryFailedMessages = require("../services/retry-failed/index");

module.exports.script = () => {
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
		await processFailedMessages();
		return { status: "process failed jobs test complete" };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			return "done";
		})
		.catch((err) => {
			console.log(err);
			return "done";
		});
};

this.script();
