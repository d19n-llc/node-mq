const database = require("../config/database/mongodb");

/**
 *
 * @param {String} collName
 */
function collection(collName) {
	return new Promise((resolve) =>
		database.useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) => {
			return resolve(res.collection(collName));
		})
	);
}

module.exports = {
	/**
	 *
	 *
	 * @param {Object} params
	 */
	async findOneAndUpdate({ collName, query, upsert, data }) {
		const dbClient = await collection(collName);
		try {
			const { lastErrorObject, value } = await dbClient.findOneAndUpdate(
				query,
				{ $set: data },
				{ upsert, returnOriginal: false }
			);
			return [undefined, value];
		} catch (error) {
			if (error.code === 66) {
				// Duplicate document based on query
				const errorMessage = new Error(
					`There is already a record matching this query ${JSON.stringify(
						query
					)}, It should be unique.`
				);
				return [errorMessage, undefined];
			}
			return [error, undefined];
		}
	},

	async aggregate({ collName, query }) {
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.aggregate(query).toArray();
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async findOne({ collName, query }) {
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.findOne(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async find({ collName, query }) {
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.find(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async insertOne({ collName, data }) {
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.insertOne(data);
			return [undefined, docs.ops[0] || {}];
		} catch (error) {
			return [error, undefined];
		}
	},

	async insertMany({ collName, data }) {
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.insertMany(data);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async deleteOne({ query, collName }) {
		try {
			const dbClient = await collection(collName);
			const doc = await dbClient.deleteOne(query);
			return [undefined, doc];
		} catch (error) {
			return [error, undefined];
		}
	},

	async deleteMany({ collName, query }) {
		try {
			const dbClient = await collection(collName);
			const result = await dbClient.deleteMany(query);
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}
};
