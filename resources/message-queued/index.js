const MessageQueuedQuery = require("../../queries/messages-queued/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-queued/query-extension");
const MessageValidator = require("../../models/message/validator");
const MessageFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageQueuedResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_messages_queued",
			QueryBuilder: MessageQueuedQuery,
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
	 * @memberof MessageQueuedResource
	 */
	async createOne(params) {
		const { object } = params;
		try {
			// Record the new pub sub route in the database
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

module.exports = MessageQueuedResource;
