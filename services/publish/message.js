const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const SubscriberResourceClass = require("../../resources/subscriber");

module.exports = async (params = {}) => {
	const { message } = params;
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
			query: {
				userAccountId: message.userAccountId,
				topics: { $in: [message.topic] }
			}
		});
		if (findError) throw new Error(findError);
		console.log(process.cwd(), { findResult });

		await seriesLoop(findResult, async (doc, index) => {
			console.log(process.cwd(), { doc });
			if (doc) {
				await sendMessageToSubscriber({ subscriberUrl: doc.subscriberUrl });

				const [updateError, updateResult] = await SubscriberResource.updateOne({
					query: { _id: doc._id },
					object: { subscriberUrl: doc.subscriberUrl, lastUpdateError }
				});
				if (updateError) throw new Error(updateError);
			}
		});

		return [undefined, { status: "messages published to subscribers" }];
	} catch (error) {
		console.log(process.cwd(), { error });
		return [error, undefined];
	}
};
