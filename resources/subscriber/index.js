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
}

module.exports = SubscriberResource;
