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
			queryBuilder: MessageProcessedQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: MessageValidator,
			factory: MessageFactory
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
		try {
			const { object } = params;
			const [createError, createResult] = await super.createOne({
				object,
				query: {
					source: object.source,
					name: object.name
				}
			});
			if (createError) throw new Error(createError);
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = MessageProcessedResource;
