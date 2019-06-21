// const internalHttp = require("../../http/requests");
// const { validate } = require("../../models/publisher/validator");
// const Publisher = require("../../models/publisher/constructor");

// module.exports.subscribe = (request, response, next) => {
// 	const { publisherUrl, topics } = request.body;

// 	let stepsCompleted = {};
// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function subscribeToPublisher() {
// 		return new Promise((resolve, reject) => {
// 			// custom logic here
// 			internalHttp.POST(
// 				{
// 					url: publisherUrl,
// 					payload: {
// 						subscriberUrl: `${process.env.APP_URL}/api/app-messages/recieve`,
// 						topics
// 					}
// 				},
// 				(err, res) => {
// 					console.log("subscribed", { res });
// 					if (err) return reject(err);
// 					stepsCompleted = Object.assign({}, stepsCompleted, {
// 						subscribedToPublisher: Object.assign({}, res, {})
// 					});
// 					return resolve();
// 				}
// 			);
// 		});
// 	}

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function storePublisher() {
// 		return new Promise((resolve, reject) => {
// 			const publisher = Publisher.constructor(
// 				stepsCompleted.subscribedToPublisher,
// 				{ isUpdating: false }
// 			);
// 			validate({ data: publisher }, { isUpdating: false }, (err, res) => {
// 				console.log({ err, res });
// 				if (err) return reject(err);
// 				// Validation passed, insert the new record into the database
// 				collection("app_publishers")
// 					.findOneAndUpdate(
// 						{
// 							userAccountId: res.userAccountId,
// 							subscriberId: res.subscriberId
// 						},
// 						{ $set: res },
// 						{ upsert: true, returnNewDocument: true }
// 					)
// 					.then((result) => {
// 						const { lastErrorObject, value } = result;
// 						if (value) {
// 							// Existing document updated
// 							stepsCompleted = Object.assign({}, stepsCompleted, {
// 								updatedExistingPublisher: { _id: value._id }
// 							});
// 							return resolve();
// 						}
// 						if (lastErrorObject) {
// 							// New document created
// 							stepsCompleted = Object.assign({}, stepsCompleted, {
// 								createdNewPublisher: { _id: lastErrorObject.upserted }
// 							});
// 							return resolve();
// 						}
// 					})
// 					.catch((error) => next(error));
// 			});
// 			return resolve();
// 		});
// 	}

// 	// Add all your functions to be processed sync / async
// 	/**
// 	 * Process functions
// 	 *
// 	 */
// 	async function asyncFunctions() {
// 		await connectToDatabase();
// 		await subscribeToPublisher();
// 		await storePublisher();
// 		return { stepsCompleted };
// 	}

// 	// Invoke our async function to process the script
// 	asyncFunctions()
// 		.then((result) => {
// 			console.log(result);
// 			return response.json(result);
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 			return next(err);
// 		});
// };
