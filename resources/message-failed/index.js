const { aggregate, findOneAndUpdate, deleteOne } = require("../mongo-methods");
const { constructor } = require("../../models/message/constructor");
const { validate } = require("../../models/message/validator");

module.exports = {
	findMany: ({ query }, callback) => {
		aggregate(
			{
				collName: "mq_messages_failed",
				query
			},
			(err, res) => {
				if (err) {
					return callback(err, undefined);
				}
				return callback(undefined, res);
			}
		);
	},
	createOne: ({ body }, callback) => {
		const job = constructor(body, { isUpdating: false });
		validate({ data: job }, { isUpdating: false }, (err, res) => {
			if (err) {
				return callback(err, undefined);
			}
			findOneAndUpdate(
				{
					collName: "mq_messages_failed",
					query: {
						source: res.source,
						name: res.name
					},
					upsert: true,
					data: res
				},
				(err, res) => {
					if (err) {
						return callback(err, undefined);
					}
					return callback(undefined, res);
				}
			);
		});
	},
	deleteOne: ({ id }, callback) => {
		deleteOne(
			{
				collName: "mq_messages_failed",
				query: {
					_id: id
				}
			},
			(err, res) => {
				if (err) {
					return callback(err, undefined);
				}
				return callback(undefined, res);
			}
		);
	}
};
