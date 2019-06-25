const internalHttp = require("../../http/requests");
const { seriesLoop } = require("../../helpers/functions");
const subsriberResource = require("../../resources/message-subscriber");

module.exports = (params, options) => {
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
	function sendMessageToSubscriber(params) {
		const { subscriberUrl } = params;
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
	function updateSubscriberStatus(params) {
		const { subscriberId } = params;
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
		await seriesLoop(subscribers, async (doc, index) => {
			await sendMessageToSubscriber();
			await updateSubscriberStatus();
		});
		return { subscribers };
	}

	asyncFunctions()
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log(err);
		});
};
