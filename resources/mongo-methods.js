const { useDb } = require("../config/database/mongodb");

module.exports = {
	/**
	 *
	 *
	 * @param {Object} params
	 * @param {Function} callback
	 */
	aggregate(params, callback) {
		const { collName, query } = params;
		console.log("calling aggregate method");
		useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) =>
			res
				.collection(collName)
				.aggregate(query)
				.toArray((err, result) => {
					if (err) {
						return callback(err, undefined);
					}
					return callback(undefined, result);
				})
		);
	},
	/**
	 *
	 *
	 * @param {Object} params
	 * @param {Function} callback
	 */
	findOneAndUpdate(params, callback) {
		const { collName, query, upsert, data } = params;
		useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) =>
			res
				.collection(collName)
				.findOneAndUpdate(
					query,
					{ $set: data },
					{ upsert, returnNewDocument: true }
				)
				.then((result) => {
					const { lastErrorObject, value } = result;
					if (value) {
						return callback(undefined, { _id: value._id });
					}
					if (lastErrorObject) {
						return callback(undefined, { _id: lastErrorObject.upserted });
					}
				})
				.catch((error) => {
					// errorCode 66 means the _id is an immutable field and cannot be updated
					// delete the _Id field and update the item
					if (error.code === 66) {
						delete data._id;
						useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) =>
							res
								.collection(collName)
								.findOneAndUpdate(
									query,
									{ $set: data },
									{ upsert, returnNewDocument: true }
								)
								.then((result) => {
									const { lastErrorObject, value } = result;
									if (value) {
										return callback(undefined, { _id: value._id });
									}
									if (lastErrorObject) {
										return callback(undefined, {
											_id: lastErrorObject.upserted
										});
									}
								})
								.catch((err) =>
									// errCode 66 means the _id is an immutable field and cannot be updated
									callback(error, undefined)
								)
						);
					} else {
						return callback(error, undefined);
					}
				})
		);
	},
	/**
	 *
	 *
	 * @param {Object} params
	 * @param {Function} callback
	 */
	findOne(params, callback) {
		const { collName, query } = params;
		useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) =>
			res
				.collection(collName)
				.findOne(query)
				.then((res) => callback(undefined, res))
				.catch((err) => callback(err, undefined))
		);
	},
	/**
	 *
	 * @param {Object} params
	 * @param {Function}callback
	 */
	deleteOne(params, callback) {
		const { collName, query } = params;
		useDb({ dbName: process.env.MQ_MONGODB_NAME }).then((res) =>
			res
				.collection(collName)
				.deleteOne(query)
				.then((res) => callback(undefined, res))
				.catch((err) => callback(err, undefined))
		);
	}
};
