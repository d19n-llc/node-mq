const BaseController = require("../base-controller");
const SubscriberResourceClass = require("../../resources/subscriber");

class SubscriberController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new SubscriberResourceClass()
		});
	}
}

module.exports = SubscriberController;
