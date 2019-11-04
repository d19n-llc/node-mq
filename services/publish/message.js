const ObjectID = require("mongodb").ObjectID;
const _ = require("lodash");
const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const { utcDate } = require("../../helpers/dates");
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
		try {
			const [error, result] = await internalHttp.POST({
				url: `${subscriberUrl}`,
				payload: Object.assign({}, message, { isPublishable: false })
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
				topics: { $in: [message.topic] }
			}
		});
		if (findError) throw new Error(findError);

		// Find subscribers
		const subscribers = _.get(findResult, "data");

		if (subscribers.length > 0)
			// Send messages to subscribers
			await seriesLoop(subscribers, async (doc, index) => {
				if (doc) {
					const [publishError] = await sendMessageToSubscriber({
						subscriberUrl: doc.subscriberUrl
					});

					const [updateError] = await SubscriberResource.updateOne({
						query: { _id: ObjectID(doc._id) },
						object: {
							subscriberUrl: doc.subscriberUrl,
							lastUpdateError: publishError ? publishError.message : "",
							lastupdatedAt: utcDate(),
							lastMessageName: message.name
						}
					});
					if (updateError) throw new Error(updateError);
				}
			});

		return [undefined, { status: "messages published to subscribers" }];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
