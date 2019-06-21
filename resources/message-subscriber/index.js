const { aggregate, findOneAndUpdate, deleteOne } = require("../mongo-methods");
const { constructor } = require("../../models/subscriber/constructor");
const { validate } = require("../../models/subscriber/validator");

module.exports = {
	findMany: ({ query }, callback) => {
		aggregate(
			{
				collName: "mq_subscribers",
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
					collName: "mq_subscribers",
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
				collName: "mq_subscribers",
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
