const internalHttp = require("../../http/requests");
const PulbisherResourceClass = require("../../resources/publisher");

module.exports = async (params = {}) => {
	const PublisherResource = new PulbisherResourceClass();
	const { publisherUrl, topics } = params;
	const pathToMessages = `${publisherUrl}/api/mq-message-processed`;
	const subsciberResponse = {};

	// Pass in the url to subscribe to a publisher
	/**
	 *
	 *
	 * @returns
	 */
	function fetchPublisherMessages() {
		return new Promise((resolve, reject) => {
			// custom logic here
			internalHttp.GET(
				{
					url: pathToMessages,
					payload: {
						query: {}
					}
				},
				(err, res) => {
					console.log("messages", { res });
					if (err) throw new Error(err);
					resolve();
				}
			);
		});
	}

	try {
		console.log({ subsciberResponse });
		// Loop over each publisher stored locally
		// await fetchPublishers();
		// await fetchPublisherMessages();
		// await addMessagesToQueue();

		// const [createError, createResult] = await MessageQueudResource.createOne({
		// 	publisherUrl: pathToMessages.require
		// });
		// if (createError) throw new Error(createError);
		return [
			undefined,
			{
				status: `Successfully fetched messages from publishers to ${process.env.APP_NAME}`
			}
		];
	} catch (error) {
		return [error, undefined];
	}
};
