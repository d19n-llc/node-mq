const uuidv1 = require("uuid/v1");
const Message = require("../models/message/constructor");
const messageResource = require("../resources/message-queued/index");
const { seriesLoop } = require("../helpers/functions");

module.exports = (params, callback = () => {}) => {
	const messagesNoRetry = [];
	for (let index = 0; index < 1; index++) {
		messagesNoRetry.push(
			Message.constructor(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `messagesNoRetry - ${uuidv1()}`,
					topic: "internal-test",
					source: "test-script",
					payload: {
						subject: "test",
						body: "this is the body",
						shouldFail: false
					},
					priority: 1
				},
				{ isUpdating: false }
			)
		);
	}

	const failedMessagesRetriable = [];
	for (let index = 0; index < 1; index++) {
		failedMessagesRetriable.push(
			Message.constructor(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `failedMessagesRetriable - ${uuidv1()}`,
					topic: "internal-test",
					source: "test-script",
					maxRetries: 4,
					payload: {
						subject: "test",
						body: "this is the body",
						shouldFail: true
					},
					priority: 1
				},
				{ isUpdating: false }
			)
		);
	}

	const failedMessagesNoRetry = [];
	for (let index = 0; index < 1; index++) {
		failedMessagesNoRetry.push(
			Message.constructor(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `failedMessagesNoRetry - ${uuidv1()}`,
					topic: "internal-test",
					source: "test-script",
					maxRetries: 0,
					payload: {
						subject: "test",
						body: "this is the body",
						shouldFail: true
					},
					priority: 1
				},
				{ isUpdating: false }
			)
		);
	}
	/**
	 *
	 *
	 * @returns
	 */
	function createMessages({ message }) {
		return new Promise((resolve, reject) => {
			messageResource.createOne({ body: message }, (err, res) => {
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
		await seriesLoop(
			[
				...messagesNoRetry,
				...failedMessagesNoRetry,
				...failedMessagesRetriable
			],
			async (msg) => {
				await createMessages({ message: msg });
			}
		);
		return {
			status: "create messages test complete",
			messagesCreated: [
				...messagesNoRetry,
				...failedMessagesNoRetry,
				...failedMessagesRetriable
			].length
		};
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
