const MessageProcessedQuery = require("../../queries/messages-processed/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-processed/query-extension");
const MessageValidator = require("../../models/message/validator");
const MessageFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageProcessedResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_messages_processed",
			QueryBuilder: MessageProcessedQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: MessageValidator,
			factory: MessageFactory
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
	 * @memberof MessageProcessedResource
	 */
	async createOne(params) {
		try {
			const { object } = params;
			const [createError, createResult] = await super.createOneNonIdempotent({
				object
			});
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = MessageProcessedResource;
