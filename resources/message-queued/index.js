const MessageQueuedQuery = require("../../queries/messages-queued/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-queued/query-extension");
const MessageQueuedValidator = require("../../models/message/validator");
const MessageQueuedFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageQueuedResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_messages_queued",
			queryBuilder: MessageQueuedQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: MessageQueuedValidator,
			factory: MessageQueuedFactory
		});
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
		const { body } = params;
		try {
			const [createError, createResult] = await super.createOne({
				object: body,
				query: {
					source: body.source,
					name: body.name
				}
			});

			if (createError) throw new Error(createError);
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = MessageQueuedResource;
