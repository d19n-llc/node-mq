const MongoClient = require("mongodb").MongoClient;
const path = require("path");

// For internal testing
require("dotenv").config({
	path: path.join(__dirname, "../../.env")
});

const databaseConnections = {};
const databaseClients = {};

/**
 * MONGODB DATABASE
 */
function mongoDb(params) {
	const { dbUri, dbName } = params;
	if (dbName in databaseConnections) {
		return databaseConnections[dbName];
	}
	return MongoClient.connect(dbUri, { useNewUrlParser: true }).then(
		(client) => {
			databaseConnections[dbName] = client.db(dbName);
			databaseClients[dbName] = client;
		}
	);
}

module.exports = {
	/**
	 * Creates all database connections
	 */
	async connectToDatabases() {
		await Promise.all([
			mongoDb({
				dbUri: process.env.MQ_MONGODB_URL,
				dbName: process.env.MQ_MONGODB_NAME
			})
		]);
	},

	/**
	 * Check the health of the database
	 */
	checkDb(params) {
		const { dbName } = params;
		return databaseConnections[dbName].command({ ping: 1 });
	},

	/**
	 * Returns database connections
	 */
	async useDb(params) {
		const { dbName } = params;
		await mongoDb({
			dbUri: process.env.MQ_MONGODB_URL,
			dbName: process.env.MQ_MONGODB_NAME
		});
		console.log("databases successfully connected");
		console.log("use database", { dbName: process.env.MQ_MONGODB_NAME });
		console.log({ dbName: process.env.MQ_MONGODB_NAME });
		return databaseConnections[dbName];
	},

	/**
	 * Returns database connections
	 */
	closeDb(params) {
		const { dbName } = params;
		return databaseClients[dbName].close();
	}
};
