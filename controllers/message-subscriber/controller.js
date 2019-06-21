const {
	findMany,
	createOne,
	deleteOne
} = require("../../resources/message-subscriber");

module.exports = {
	findMany: ({ params, body }, response, next) => {
		findMany({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	},
	createOne: ({ params, body }, response, next) => {
		createOne({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(
				Object.assign({}, res, {
					publisherUrl: process.env.MQ_MESSAGES_URL
				})
			);
		});
	},
	deleteOne: ({ params, body }, response, next) => {
		deleteOne({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	}
};
