const {
	findMany,
	createOne,
	deleteOne
} = require("../../resources/message-subscriber");

module.exports = {
	findMany: (request, response, next) => {
		const { params, body } = request;
		findMany({ body }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(res);
		});
	},
	createOne: (request, response, next) => {
		const { params, body } = request;
		createOne({ body }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(
				Object.assign({}, res, {
					publisherUrl: process.env.MQ_MESSAGES_URL
				})
			);
		});
	},
	deleteOne: (request, response, next) => {
		const { params } = request;
		deleteOne({ params }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(res);
		});
	}
};
