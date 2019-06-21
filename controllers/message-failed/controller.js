const { findMany } = require("../../resources/message-failed");

module.exports = {
	findMany: ({ params, body }, response, next) => {
		findMany({ body }, (err, res) => {
			console.log({ err, res });
			response.status(200).json(res);
		});
	}
};
