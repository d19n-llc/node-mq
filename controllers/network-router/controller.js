const BaseController = require("../base-controller");
const NetworkRouterResourceClass = require("../../resources/network-router");

class NetworkRouterController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new NetworkRouterResourceClass()
		});
	}
}

module.exports = NetworkRouterController;
