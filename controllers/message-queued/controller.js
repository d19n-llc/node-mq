const BaseController = require("../base-controller");
const MessageQueuedResourceClass = require("../../resources/message-queued");

class MessageQueuedController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new MessageQueuedResourceClass()
		});
	}
}

module.exports = MessageQueuedController;
