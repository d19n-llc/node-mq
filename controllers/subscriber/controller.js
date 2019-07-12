const BaseController = require("../base-controller");
const SubscriberResourceClass = require("../../resources/subscriber");

class SubscriberController extends BaseController {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			resourceModule: new SubscriberResourceClass()
		});
	}

	// eslint-disable-next-line class-methods-use-this
	async createOne(request, response, next) {
		const { body } = request;
		const [error, result] = super.createOne({ object: body });
		if (error) return next(error);
		response.status(200).json(
			Object.assign({}, result, {
				publisherUrl: process.env.MQ_MESSAGES_URL
			})
		);
	}
}

module.exports = SubscriberController;
