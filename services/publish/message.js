const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const SubscriberResourceClass = require("../../resources/subscriber");

module.exports = async (params = {}) => {
	const { message } = params;
	const subscribers = [];
	let lastUpdateError = {};
	const SubscriberResource = new SubscriberResourceClass();

	/**
	 *
	 *
	 * @returns
	 */
	function sendMessageToSubscriber(params) {
		const { subscriberUrl } = params;
		return new Promise((resolve, reject) => {
			internalHttp.POST(
				{
					url: `${subscriberUrl}`,
					payload: message
				},
				(err, res) => {
					lastUpdateError = { err };
					return resolve();
				}
			);
		});
	}

	/**
	 * Process functions
	 *
	 */
	try {
		const [findError, findResult] = await SubscriberResource.findMany({
			query: { topics: { $in: [message.topic] } }
		});
		if (findError) throw new Error(findError);

		await seriesLoop(subscribers, async (doc, index) => {
			await sendMessageToSubscriber({ subscriberUrl: doc.subscriberUrl });

			const [updateError, updateResult] = await SubscriberResource.updateOne({
				id: doc._id,
				body: { subscriberUrl: doc.subscriberUrl, lastUpdateError }
			});
			if (updateError) throw new Error(updateError);
		});

		return [undefined, { status: "messages published to subscribers" }];
	} catch (error) {
		return [error, undefined];
	}
};
