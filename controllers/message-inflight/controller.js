const { findMany } = require("../../resources/message-inflight");
const moveBatchToQueue = require("../../services/rollback/inflight-batch-failed");

module.exports = {
	findMany: (request, response, next) => {
		const { params, body } = request;
		findMany({ body }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(res);
		});
	},
	batchRetry: (request, response, next) => {
		const { body } = request;
		const { batchId } = body;
		moveBatchToQueue({ batchId }, (err, res) => {
			if (err) return next(err);
			response.status(200).json(res);
		});
	}
};
