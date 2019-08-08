const SubscriberQuery = require("../../queries/subscriber/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/subscriber/query-extension");
const SubscriberValidator = require("../../models/subscriber/validator");
const SubscriberFactory = require("../../models/subscriber/factory");
const BaseResource = require("../base-resource");
const SubscribeToPublisher = require("../../services/subscribe/create-pub-sub-relationship");

class SubscriberResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_subscriber",
			QueryBuilder: SubscriberQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: SubscriberValidator,
			factory: SubscriberFactory
		});
		this.createOne = this.createOne.bind(this);
	}

	/**
	 *
	 *
	 * @param {*} request
	 * @param {*} response
	 * @param {*} next
	 * @returns
	 * @memberof PublisherResource
	 */
	async createOne(params) {
		try {
			const { object } = params;
			const [createError, createResult] = await SubscribeToPublisher({
				object
			});
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = SubscriberResource;
