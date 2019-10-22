const NodeQuery = require("../../queries/node/query");
const {
	findOneAggregation,
	findManyAggregation
} = require("../../queries/node/query-extension");
const NodeValidator = require("../../models/node/validator");
const NodeFactory = require("../../models/node/factory");
const BaseResource = require("../base-resource");

class NodeResource extends BaseResource {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super({
			collectionName: "mq_nodes",
			QueryBuilder: NodeQuery,
			queryExtensionFindOne: findOneAggregation,
			queryExtensionFindMany: findManyAggregation,
			validator: NodeValidator,
			factory: NodeFactory
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
	 * @memberof PublisherResource
	 */
	async createOne(params) {
		try {
			const { object } = params;
			const [createError, createResult] = await super.createOne({
				object,
				query: {
					dockerId: object.dockerId
				}
			});
			if (createError) return [createError, undefined];
			return [undefined, createResult];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = NodeResource;
