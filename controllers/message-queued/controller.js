const { findMany, createOne } = require("../../resources/message-queued");

module.exports = {
	findMany: ({ params, body }, response, next) => {
		findMany({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	},
	createOne: ({ body }, response, next) => {
		createOne({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	}
};
