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
	const SubscriberResource = new SubscriberResourceClass();

	/**
	 *
	 *
	 * @returns
	 */
	async function sendMessageToSubscriber({ subscriberUrl }) {
		// custom logic here
		try {
			const [error, result] = await internalHttp.POST({
				url: `${subscriberUrl}`,
				payload: message
			});

			if (error) throw new Error(error);
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
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
				const [publishError, publishResult] = await sendMessageToSubscriber({
					subscriberUrl: doc.subscriberUrl
				});

				const [updateError, updateResult] = await SubscriberResource.updateOne({
					query: { _id: doc._id },
					object: {
						subscriberUrl: doc.subscriberUrl,
						lastUpdateError: publishError
					}
				});
				if (updateError) throw new Error(updateError);
			}
		});

		return [undefined, { status: "messages published to subscribers" }];
	} catch (error) {
		return [error, undefined];
	}
};
