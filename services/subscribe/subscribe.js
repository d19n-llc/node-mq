const internalHttp = require("../../http/requests");
const PulbisherResourceClass = require("../../resources/publisher");

module.exports.SubscribeToPublisher = async (params = {}) => {
	const PublisherResource = new PulbisherResourceClass();
	const { publisherUrl, topics } = params;
	const pathToSubscibe = `${publisherUrl}/api/mq-subscriber`;
	const pathToMessages = `${publisherUrl}/api/mq-message-processed`;
	let publisherResponse = {};

	// Pass in the url to subscribe to a publisher
	/**
	 *
	 *
	 * @returns
	 */
	function subscribeToPublisher() {
		return new Promise((resolve, reject) => {
			// custom logic here
			internalHttp.POST(
				{
					url: pathToSubscibe,
					payload: {
						subscriberUrl: `${process.env.APP_URL}/api/mq-message-queued`,
						topics
					}
				},
				(err, res) => {
					console.log("subscribed", { res });
					publisherResponse = res;
					if (err) throw new Error(err);
					resolve();
				}
			);
		});
	}

	try {
		await subscribeToPublisher();
		const [createError, createResult] = await PublisherResource.createOne({
			object: {
				userAccountId: publisherResponse.value.userAccountId || "no_id",
				publisherUrl: pathToMessages,
				subscriberId: publisherResponse.value._id || "no_id"
			}
		});

		console.log({ createResult });

		if (createError) throw new Error(createError);

		return [
			undefined,
			{ status: `Successfully subscribed to ${process.env.APP_NAME}` }
		];
	} catch (error) {
		console.log({ error });
		return [error, undefined];
	}
};
