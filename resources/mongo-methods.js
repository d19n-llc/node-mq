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
		console.log({ collName, query, upsert, data });
		try {
			const dbClient = await collection(collName);
			const docs = await dbClient.findOne(query);
			console.log({ docs });
			const fields = data;
			if (docs[0] && docs[0].data.length > 0) {
				// delete the _id from the fields if the document exists to avoid
				// an error updating an immutable field.
				delete fields._id;
			}
			console.log({ fields });
			const { lastErrorObject, value } = await dbClient.findOneAndUpdate(
				query,
				{ $set: fields },
				{ upsert, returnOriginal: false }
			);
			console.log({ lastErrorObject, value });
			if (value) {
				return [undefined, value];
			}
			if (lastErrorObject) {
				// No documents were updated
				if (!lastErrorObject.updatedExisting) {
					throw new Error(
						`No documents where updated with your query: ${JSON.stringify(
							query
						)}`
					);
				}
			}
			return [new Error("Could not process find one and update"), undefined];
		} catch (error) {
			console.log({ error });
			return [error, undefined];
		}
	},

	async updateMany({ data, query, collName }) {
		try {
			const dbClient = await collection(collName);
			const result = await dbClient.updateMany(query, {
				$set: data
			});
			return [undefined, result];
		} catch (error) {
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
