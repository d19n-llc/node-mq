const { findMany } = require("../../resources/message-failed");

module.exports = {
	findMany: (request, response, next) => {
		const { params, body } = request;
		findMany({ body }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(res);
		});
	}
};
