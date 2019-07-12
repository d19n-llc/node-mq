const BaseController = require("../base-controller");
const MessageProcessedResourceClass = require("../../resources/message-processed");

class MessageProcessedController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new MessageProcessedResourceClass()
		});
	}
}

module.exports = MessageProcessedController;
