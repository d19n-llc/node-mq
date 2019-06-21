// const internalHttp = require("../../../http/requests");
// const { validate } = require("../../../models/publisher/validator");
// const Publisher = require("../../../models/publisher/constructor");

// module.exports = (params, options) => {
// 	const { message } = params;
// 	let stepsCompleted = {};
// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function findSubscribers() {
// 		return new Promise((resolve, reject) => {
// 			collection("app_subscribers")
// 				.aggregate([{ $match: {} }])
// 				.toArray((error, result) => {
// 					console.log(object);
// 					return resolve();
// 				});
// 		});
// 	}

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function storeMessage(params) {
// 		return new Promise((resolve, reject) => {
// 			collection("app_messages")
// 				.insertOne(message)
// 				.then(() => resolve())
// 				.catch((err) => reject(err));
// 		});
// 	}

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function sendMessageToSubscriber(params) {
// 		const { subscriberUrl, message } = params;
// 		return new Promise((resolve, reject) => {
// 			internalHttp.POST(
// 				{
// 					url: `${subscriberUrl}`,
// 					payload: message,
// 				},
// 				(err, res) => {
// 					console.log("message sent", { res });
// 					// Do not reject on error continue running and update the errors
// 					// if (err) return reject(err);
// 					stepsCompleted = Object.assign({}, stepsCompleted, {
// 						sendMessageToSubscriber: Object.assign({}, res, {
// 							userAccountId: "1234",
// 						}),
// 					});
// 					return resolve();
// 				},
// 			);
// 		});
// 	}

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function updateSubscriberStatus(params) {
// 		const { subscriberId } = params;
// 		return new Promise((resolve, reject) => {
// 			collection("app_subscribers")
// 				.findOneAndUpdate({ _id: ObjectID(subscriberId) }, { $set: {} })
// 				.then(() => resolve())
// 				.catch((err) => reject(err));
// 		});
// 	}

// 	// Add all your functions to be processed sync / async
// 	/**
// 	 * Process functions
// 	 *
// 	 */
// 	async function asyncFunctions() {
// 		await connectToDatabase();
// 		await findSubscribers();
// 		await seriesLoop(subscribers, async (doc, index) => {
// 			await sendMessageToSubscriber();
// 			await updateSubscriberStatus();
// 		});
// 		return { stepsCompleted };
// 	}

// 	// Invoke our async function to process the script
// 	asyncFunctions()
// 		.then((result) => {
// 			console.log(result);
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 		});
// };
