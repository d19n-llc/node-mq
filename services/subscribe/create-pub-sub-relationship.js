const internalHttp = require("../../http/requests");
const PulbisherResourceClass = require("../../resources/publisher");
const { makeError } = require("../../helpers/errors.js");

module.exports = async ({ object = {} }) => {
	// eslint-disable-next-line global-require
	const PublisherResource = new PulbisherResourceClass();
	const { publisherUrl, subscriberUrl, topics } = object;
	// EXAMPLE:
	// http://localhost:8091/api (api url of publisher)
	// http://localhost:8098/api (api url of subscriber)
	// topics: ["contacts", "accounts", "users"]
	const pathToSubscibe = `${publisherUrl}/mq-subscriber`;
	// This is where you would retrieve messages that have been processed
	const pathToMessages = `${publisherUrl}/mq-message-processed`;
	const publisherResponse = {};

	// Pass in the url to subscribe to a publisher
	/**
	 *
	 *
	 * @returns
	 */
	async function subscribeToPublisher() {
		// custom logic here
		try {
			const [error, result] = await internalHttp.POST({
				url: pathToSubscibe,
				payload: {
					subscriberUrl: `${subscriberUrl}/mq-message-queued`,
					topics
				}
			});

			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	try {
		const [subscribeError] = await subscribeToPublisher();
		if (subscribeError) return [makeError(subscribeError), undefined];

		const [createError] = await PublisherResource.createOne({
			object: {
				userAccountId: publisherResponse.userAccountId || "no_id",
				publisherUrl: pathToMessages,
				subscriberId: publisherResponse._id || "no_id"
			}
		});
		if (createError) return [makeError(createError), undefined];

		return [
			undefined,
			{ status: `Successfully subscribed to ${publisherUrl}` }
		];
	} catch (error) {
		console.error(error);
		return [makeError(error), undefined];
	}
};
