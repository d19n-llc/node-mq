const NetworkRouterQuery = require("../../queries/network-router/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/network-router/query-extension");
const NetworkRouterValidator = require("../../models/message/validator");
const NetworkRouterFactory = require("../../models/message/factory");
const BaseResource = require("../base-resource");
const CreateNewRoute = require("../../services/network-router/create-route");
const { makeError } = require("../../helpers/errors");

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
			const [createRouteError, createRouteResult] = await CreateNewRoute({
				object
			});
			if (createRouteError) return [makeError(createRouteError), undefined];
			// Record the new pub sub route in the database
			const [createError, createResult] = await super.createOneNonIdempotent({
				object
			});
			console.log({ createError, createResult });
			if (createError) return [makeError(createError), undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = NetworkRouterResource;
