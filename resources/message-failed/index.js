const MessageFailedQuery = require("../../queries/messages-failed/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-failed/query-extension");
const MessageFailedValidator = require("../../models/message/validator");
const MessageFailedFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageFailedResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "messages_failed",
			queryBuilder: MessageFailedQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: MessageFailedValidator,
			factory: MessageFailedFactory
		});
	}
}

module.exports = MessageFailedResource;
