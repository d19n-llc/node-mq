const BaseController = require("../base-controller");
const MessageFailedResourceClass = require("../../resources/message-failed");

class MessageFailedController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new MessageFailedResourceClass()
		});
	}
}

module.exports = MessageFailedController;
