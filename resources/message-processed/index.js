const MessageProcessedQuery = require("../../queries/messages-processed/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-processed/query-extension");
const MessageProcessedValidator = require("../../models/message/validator");
const MessageProcessedFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageProcessedResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_messages_processed",
			queryBuilder: MessageProcessedQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: MessageProcessedValidator,
			factory: MessageProcessedFactory
		});
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
		const { body } = params;

		const [createError, createResult] = await super.createOne({
			object: body,
			query: {
				source: body.source,
				name: body.name
			}
		});
		return [createError, createResult];
	}
}

module.exports = MessageProcessedResource;
