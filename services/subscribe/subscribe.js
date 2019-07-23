const internalHttp = require("../../http/requests");
const PulbisherResourceClass = require("../../resources/publisher");

module.exports.SubscribeToPublisher = async (params = {}) => {
	// eslint-disable-next-line global-require
	require("dotenv").config({
		path: `${process.cwd()}/.env`
	});

	const PublisherResource = new PulbisherResourceClass();
	const { publisherUrl, topics } = params;
	const pathToSubscibe = `${publisherUrl}/api/mq-subscriber`;
	const pathToMessages = `${publisherUrl}/api/mq-message-processed`;
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
					subscriberUrl: `${process.env.APP_URL}/api/mq-message-queued`,
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
		const [subscribeError, subscribeResult] = await subscribeToPublisher();
		if (subscribeError) throw new Error(subscribeError);

		const [createError, createResult] = await PublisherResource.createOne({
			object: {
				userAccountId: publisherResponse.userAccountId || "no_id",
				publisherUrl: pathToMessages,
				subscriberId: publisherResponse._id || "no_id"
			}
		});
		if (createError) throw new Error(createError);

		return [
			undefined,
			{ status: `Successfully subscribed to ${process.env.APP_NAME}` }
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
