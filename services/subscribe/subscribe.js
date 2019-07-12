const internalHttp = require("../../http/requests");
const { validate } = require("../../models/publisher/validator");
const Publisher = require("../../models/publisher/factory");

module.exports.subscribe = (params = {}) => {
	const { publisherUrl, topics } = params;

	// Pass in the url to subscribe to a publisher
	/**
	 *
	 *
	 * @returns
	 */
	function subscribeToPublisher() {
		return new Promise((resolve, reject) => {
			// custom logic here
			internalHttp.POST(
				{
					url: publisherUrl,
					payload: {
						subscriberUrl: `${process.env.APP_URL}/api/mq-message-queued`,
						topics
					}
				},
				(err, res) => {
					console.log("subscribed", { res });
					if (err) return reject(err);
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
	function storePublisher() {
		return new Promise((resolve, reject) => {
			const publisher = Publisher.constructor(
				stepsCompleted.subscribedToPublisher,
				{ isUpdating: false }
			);
			validate({ data: publisher }, { isUpdating: false }, (err, res) => {
				console.log({ err, res });
				if (err) return reject(err);
				// Validation passed, insert the new record into the database
				collection("app_publishers")
					.findOneAndUpdate(
						{
							userAccountId: res.userAccountId,
							subscriberId: res.subscriberId
						},
						{ $set: res },
						{ upsert: true, returnNewDocument: true }
					)
					.then((result) => {
						const { lastErrorObject, value } = result;
						if (value) {
							return resolve();
						}
						if (lastErrorObject) {
							return resolve();
						}
					})
					.catch((error) => next(error));
			});
			return resolve();
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		await subscribeToPublisher();
		await storePublisher();
		return { status: `Successfully subscribed to ${process.env.APP_NAME}` };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			return [undefined, result];
		})
		.catch((error) => {
			console.log(err);
			return [error, undefined];
		});
};
