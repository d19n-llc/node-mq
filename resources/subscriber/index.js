const SubscriberQuery = require("../../queries/subscriber/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/subscriber/query-extension");
const SubscriberValidator = require("../../models/subscriber/validator");
const SubscriberFactory = require("../../models/subscriber/factory");
const BaseResource = require("../base-resource");

class SubscriberResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_subscriber",
			queryBuilder: SubscriberQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: SubscriberValidator,
			factory: SubscriberFactory
		});
	}

	/**
	 *
	 *
	 * @param {*} request
	 * @param {*} response
	 * @param {*} next
	 * @returns
	 * @memberof SubscriberResource
	 */
	async createOne(params) {
		const { body } = params;

		const [createError, createResult] = await super.createOne({
			object: body,
			query: {
				subscriberUrl: body.subscriberUrl
			}
		});
		return [createError, createResult];
	}
}

module.exports = SubscriberResource;
