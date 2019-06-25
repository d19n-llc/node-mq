module.exports.ProcessMessageTest = ({ message }, callback) => {
	/**
	 *
	 *
	 * @returns
	 */
	function processMessage() {
		return new Promise((resolve, reject) => {
			if (message.payload && message.payload.shouldFail) {
				return reject(
					new Error("This message was set to fail and was not processed.")
				);
			}
			return resolve();
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		await processMessage();
		return { status: "test message processed" };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			return callback(undefined, result);
		})
		.catch((err) => {
			return callback(err, undefined);
		});
};
