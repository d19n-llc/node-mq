const { useDb } = require("../database/mongodb");

module.exports.CreateCollections = () => {
	/**
	 *
	 *
	 * @returns
	 */
	function createCollections() {
		return new Promise((resolve) => {
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_publishers");
					res
						.collection("mq_publishers")
						.createIndex({ userAccountId: 1, url: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_subscribers");
					res
						.collection("mq_subscriber")
						.createIndex({ userAccountId: 1, url: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_messages_queued");
					res
						.collection("mq_messages_queued")
						.createIndex({ createdAt: 1, topic: 1, name: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_messages_inflight");
					res.collection("mq_messages_inflight").createIndex({ name: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_messages_failed");
					res.collection("mq_messages_failed").createIndex({ name: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			try {
				useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
					res.createCollection("mq_messages_processed");
					res.collection("mq_messages_failed").createIndex({ name: 1 });
				});
			} catch (error) {
				// Catch errors
			}
			return resolve();
		});
	}

	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		// Uncomment to use a database connection
		await createCollections();
		// await createCollectionIndexes();
		return { status: "script processed" };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			process.exit();
		})
		.catch((err) => {
			console.log(err);
		});
};
