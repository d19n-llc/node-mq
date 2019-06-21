const {
	findMany,
	createOne,
	deleteOne
} = require("../../resources/message-publisher");

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
			response.status(200).json(res);
		});
	},
	deleteOne: ({ params, body }, response, next) => {
		deleteOne({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	}
};
