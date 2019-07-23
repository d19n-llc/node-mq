const MessageInflightQuery = require("../../queries/messages-inflight/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-inflight/query-extension");
const MessageValidator = require("../../models/message/validator");
const MessageFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class MessageInflightResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_messages_inflight",
			queryBuilder: MessageInflightQuery,
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
	 * @memberof MessageInflightResource
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
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = MessageInflightResource;
