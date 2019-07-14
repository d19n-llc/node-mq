const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const SubscriberResourceClass = require("../../resources/subscriber");
/**
 *
 *
 * @param {*} { message }
 * @returns
 */
module.exports = async ({ message }) => {
	let lastUpdateError = {};
	const SubscriberResource = new SubscriberResourceClass();

	/**
	 *
	 *
	 * @returns
	 */
	function sendMessageToSubscriber({ subscriberUrl }) {
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

		await seriesLoop(findResult, async (doc, index) => {
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
		return [error, undefined];
	}
};
