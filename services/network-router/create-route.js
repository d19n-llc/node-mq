const internalHttp = require("../../http/requests");
const { makeError } = require("../../helpers/errors.js");

module.exports = async ({ object = {} }) => {
	// eslint-disable-next-line global-require
	const { publisherUrl, subscriberUrl, topics } = object;
	// EXAMPLE:
	// http://localhost:8091/api (api url of publisher)
	// http://localhost:8098/api (api url of subscriber)
	// topics: ["contacts", "accounts", "users"]
	// This is where you would retrieve messages that have been processed
	const publisherResponse = {};

	// Pass in the url to subscribe to a publisher
	/**
	 *
	 *
	 * @returns
	 */
	async function createSubscriberOnPublisher() {
		// custom logic here
		try {
			const [error, result] = await internalHttp.POST({
				url: `${publisherUrl}/mq-subscriber`,
				payload: {
					subscriberUrl: `${subscriberUrl}/mq-message-queued`, // endpoint where new messages are received
					topics
				}
			});

			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @returns
	 */
	async function createPublisherOnSubscriber() {
		// custom logic here
		try {
			const [error, result] = await internalHttp.POST({
				url: `${subscriberUrl}/mq-publisher`,
				payload: {
					userAccountId: publisherResponse.userAccountId || "no_id",
					publisherUrl: `${publisherUrl}/mq-message-processed`, // endpoint where historic messages are retreived
					subscriberId: publisherResponse._id || "no_id"
				}
			});

			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	try {
		const [createSubErr, createSubRes] = await createSubscriberOnPublisher();
		if (createSubErr) return [makeError(createSubErr), undefined];
		console.log({ createSubRes });

		const [createPubErr, createPubRes] = await createPublisherOnSubscriber();
		if (createPubErr) return [makeError(createPubErr), undefined];
		console.log({ createPubRes });

		return [
			undefined,
			{
				status: `Successfully created route publisher: ${publisherUrl} -> subscriber ${subscriberUrl} for topics: ${JSON.stringify(
					topics
				)}`
			}
		];
	} catch (error) {
		console.error(error);
		return [makeError(error), undefined];
	}
};
