const { useDb } = require("../database/mongodb");

module.exports.RemoveCollections = ({ deleteAll = "REJECT" }) => {
	if (deleteAll !== "APPROVE") {
		throw new Error(
			"To confirm you want to remove all collections you need to run uninstall.run({deleteAll: APPROVE})"
		);
	}
	/**
	 *
	 *
	 * @returns
	 */
	function dropCollections() {
		return new Promise((resolve, reject) => {
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_publishers")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_subscribers")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_messages_queued")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_messages_inflight")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_messages_failed")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME })
					.collection("mq_messages_processed")
					.drop();
			} catch (error) {
				console.log({ error });
			}
			return resolve();
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		// Uncomment to use a database connection
		await dropCollections();
		return { status: "collections removed" };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			console.log(err);
		});
};
