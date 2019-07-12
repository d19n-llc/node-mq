const BaseController = require("../base-controller");
const PublisherResourceClass = require("../../resources/publisher");

class PublisherController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new PublisherResourceClass()
		});
	}
}

module.exports = PublisherController;
