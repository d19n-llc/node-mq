const PublisherQuery = require("../../queries/publisher/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/messages-failed/query-extension");
const PublisherValidator = require("../../models/message/validator");
const PublisherFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");

class PublisherResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_publishers",
			queryBuilder: PublisherQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: PublisherValidator,
			factory: PublisherFactory
		});
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
			const { body } = params;
			const [createError, createResult] = await super.createOne({
				object: body,
				query: {
					publisherUrl: body.publisherUrl
				}
			});
			if (createError) throw new Error(createError);
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = PublisherResource;
