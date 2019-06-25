const { asyncForLoop } = require("../helpers/functions");
const createMessages = require("./create-messages");
const processMessages = require("./process-messages");
const retryMessages = require("./retry-messages");
const deleteMessages = require("./delete-messages");

module.exports.RunTests = () => {
	/**
	 *
	 *
	 * @returns
	 */
	function seedDataInQueue() {
		return new Promise((resolve, reject) => {
			createMessages({}, (err, res) => {
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
	function processMessagesInQueue() {
		return new Promise((resolve, reject) => {
			processMessages({}, (err, res) => {
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
	function retryMessagesFailed() {
		return new Promise((resolve, reject) => {
			retryMessages({}, (err, res) => {
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
	function deleteAllTestsMessages() {
		return new Promise((resolve, reject) => {
			deleteMessages({}, (err, res) => {
				if (err) return reject(err);
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
		const res1 = await seedDataInQueue();
		let res2;
		let res3;
		// test that the failed messages are retried for the total maxRetries count
		await asyncForLoop({ total: 4, incrementBy: 1 }, async (doc, index) => {
			res2 = await processMessagesInQueue();
			res3 = await retryMessagesFailed();
		});
		const res4 = await deleteAllTestsMessages();
		return { res1, res2, res3, res4 };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			process.exit();
		})
		.catch((err) => {
			console.log(err);
		});
};
