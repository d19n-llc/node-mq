const uuidv1 = require("uuid/v1");
const MessageFactory = require("../models/message/factory");
const MessageQueuedResourceClass = require("../resources/message-queued");
const { seriesLoop } = require("../helpers/functions");

module.exports = async (params = {}) => {
	const messagesNoRetry = [];

	for (let index = 0; index < 1; index++) {
		messagesNoRetry.push(
			MessageFactory(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `messagesNoRetry - ${uuidv1()}`,
					topic: "internal-test",
					action: "created",
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
			MessageFactory(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `failedMessagesRetriable - ${uuidv1()}`,
					topic: "internal-test",
					action: "created",
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
			MessageFactory(
				{
					userAccountId: "5cf1a9f8b79aa40017af4c46",
					name: `failedMessagesNoRetry - ${uuidv1()}`,
					topic: "internal-test",
					action: "created",
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

	try {
		const MessageQueuedResource = new MessageQueuedResourceClass();

		await seriesLoop(
			[
				...messagesNoRetry,
				...failedMessagesNoRetry,
				...failedMessagesRetriable
			],
			async (msg) => {
				const [createError] = await MessageQueuedResource.createOne({
					body: msg
				});
				if (createError) throw new Error(createError);
			}
		);

		return [
			undefined,
			{
				status: "create messages test complete",
				messagesCreated: [
					...messagesNoRetry,
					...failedMessagesNoRetry,
					...failedMessagesRetriable
				].length
			}
		];
	} catch (error) {
		console.log({ error });
		return [error, undefined];
	}
};
