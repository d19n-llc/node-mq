const PublisherQuery = require("../../queries/publisher/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/publisher/query-extension");
const PublisherValidator = require("../../models/publisher/validator");
const PublisherFactory = require("../../models/publisher/factory");
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
			const { object } = params;
			const [createError, createResult] = await super.createOne({
				object,
				query: {
					publisherUrl: object.publisherUrl
				}
			});
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = PublisherResource;
