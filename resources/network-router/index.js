const NetworkRouterQuery = require("../../queries/network-router/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/network-router/query-extension");
const NetworkRouterValidator = require("../../models/message/validator");
const NetworkRouterFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");
const CreateNewRoute = require("../../services/network-router/create-route");

class NetworkRouterResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_network_routes",
			QueryBuilder: NetworkRouterQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: NetworkRouterValidator,
			factory: NetworkRouterFactory
		});
	}

	/**
	 *
	 *
	 * @param {*} request
	 * @param {*} response
	 * @param {*} next
	 * @returns
	 * @memberof NetworkRouterResource
	 */
	async createOne(params) {
		try {
			const { object } = params;
			const [createError, createResult] = await CreateNewRoute({
				object
			});
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = NetworkRouterResource;
