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
			const client = await collection(collName);
			const docs = await client.findOneAndUpdate(
				query,
				{ $set: data },
				{ upsert, returnOriginal: false }
			);
			console.log({ docs });
			return [undefined, docs];
			// if (value) {
			// 	return [undefined, value];
			// }
			// if (lastErrorObject) {
			// 	return [lastErrorObject, undefined];
			// }
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
			const client = await collection(collName);
			const docs = await client.aggregate(query).toArray();
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async findOne({ collName, query }) {
		try {
			const client = await collection(collName);
			const docs = await client.findOne(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async find({ collName, query }) {
		try {
			const client = await collection(collName);
			const docs = await client.find(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async insertMany({ collName, data }) {
		try {
			const client = await collection(collName);
			const docs = await client.insertMany(data);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async deleteOne({ collName, query }) {
		try {
			const client = await collection(collName);
			const docs = await client.deleteOne(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	},

	async deleteMany({ collName, query }) {
		try {
			const client = await collection(collName);
			const docs = await client.deleteMany(query);
			return [undefined, docs];
		} catch (error) {
			return [error, undefined];
		}
	}
};
