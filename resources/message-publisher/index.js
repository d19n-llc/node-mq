const { aggregate, findOneAndUpdate, deleteOne } = require("../mongo-methods");
const { constructor } = require("../../models/publisher/constructor");
const { validate } = require("../../models/publisher/validator");

module.exports = {
	findMany: ({ query }, callback) => {
		aggregate(
			{
				collName: "mq_publishers",
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
		const publisher = constructor(body, { isUpdating: false });
		validate({ data: publisher }, { isUpdating: false }, (err, res) => {
			if (err) {
				return callback(err, undefined);
			}
			findOneAndUpdate(
				{
					collName: "mq_publishers",
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
				collName: "mq_publishers",
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
