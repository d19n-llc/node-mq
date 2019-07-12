const BaseController = require("../base-controller");
const MessageInflightResourceClass = require("../../resources/message-inflight");
const moveBatchToQueue = require("../../services/rollback/inflight-batch-failed");

class MessageInflightController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new MessageInflightResourceClass()
		});
	}

	// eslint-disable-next-line class-methods-use-this
	async batchRetry(request, response, next) {
		const { body } = request;
		const { batchId } = body;
		const [error, result] = moveBatchToQueue({ batchId });
		if (error) return next(error);
		response.status(200).json(result);
	}
}

module.exports = MessageInflightController;
