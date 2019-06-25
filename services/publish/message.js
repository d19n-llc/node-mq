const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const subsriberResource = require("../../resources/message-subscriber");

module.exports.PublishMessage = (params, callback = () => {}) => {
	const { message } = params;
	let subscribers = [];
	let lastUpdateError = {};
	/**
	 *
	 *
	 * @returns
	 */
	function findSubscribers() {
		return new Promise((resolve, reject) => {
			subsriberResource.findMany(
				{ query: [{ $match: { topics: { $in: [message.topic] } } }] },
				(err, res) => {
					console.log(err, res);
					if (err) return reject(err);
					subscribers = res;
					return resolve();
				}
			);
		});
	}
	/**
	 *
	 *
	 * @returns
	 */
	function sendMessageToSubscriber({ subscriberUrl }) {
		console.log({ subscriberUrl });
		return new Promise((resolve, reject) => {
			internalHttp.POST(
				{
					url: `${subscriberUrl}`,
					payload: message
				},
				(err, res) => {
					console.log("message sent", { res });
					lastUpdateError = { err };
					return resolve();
				}
			);
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function updateSubscriberStatus({ subscriberId }) {
		return new Promise((resolve, reject) => {
			subsriberResource.updateOne(
				{ id: subscriberId, body: { lastUpdateError } },
				(err, res) => {
					if (err) return reject(err);
					return resolve(res);
				}
			);
		});
	}

	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		await findSubscribers();
		console.log({ subscribers });
		await seriesLoop(subscribers, async (doc, index) => {
			await sendMessageToSubscriber({ subscriberUrl: doc.subscriberUrl });
			await updateSubscriberStatus({ subscriberId: doc._id });
		});
		return { subscribers };
	}

	asyncFunctions()
		.then((res) => {
			console.log(res);
			callback(undefined, res);
		})
		.catch((err) => {
			console.log(err);
			callback(err, undefined);
		});
};
