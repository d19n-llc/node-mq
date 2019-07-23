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
		try {
			const client = collection(collName);
			const { lastErrorObject, value } = await client.findOneAndUpdate(
				query,
				{ $set: data },
				{ upsert, returnOriginal: false }
			);
			if (lastErrorObject) {
				return [lastErrorObject, undefined];
			}
			return [undefined, value];
		} catch (error) {
			if (error.code === 66) {
				const queryKeys = Object.keys(query);
				const errorMessage = new Error(
					`There is already a record with this ${queryKeys}, choose a new one`
				);
				return [errorMessage, undefined];
			}
			return [error, undefined];
		}
	},

	async aggregate({ collName, query }) {
		try {
			const client = collection(collName);
			const docs = await client.aggregate(query).toArray();
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async findOne({ collName, query }) {
		try {
			const client = collection(collName);
			const docs = await client.findOne(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async find({ collName, query }) {
		try {
			const client = collection(collName);
			const docs = await client.find(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async insertMany({ collName, data }) {
		try {
			const client = collection(collName);
			const docs = await client.insertMany(data);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async deleteOne({ collName, query }) {
		try {
			const docs = collection(collName).deleteOne(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	}
};
