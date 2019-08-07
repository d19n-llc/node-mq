const {
	insertOne,
	findOneAndUpdate,
	aggregate,
	deleteOne,
	insertMany,
	deleteMany
} = require("./mongo-methods");

class BaseResource {
	constructor({
		collectionName,
		QueryBuilder,
		queryExtensionFindOne = [],
		queryExtensionFindMany = [],
		validator,
		factory,
		cascadingDeletes = null,
		addMessageToQueue,
		logUserEvent
	}) {
		if (!collectionName) throw new Error("No coll name provided");
		if (!QueryBuilder) throw new Error("No query builder provided");
		if (!validator) throw new Error("No validator provided");
		if (!factory) throw new Error("No factory module provided");

		this.collectionName = collectionName;
		this.QueryBuilder = QueryBuilder;
		this.queryExtensionFindOne = queryExtensionFindOne;
		this.queryExtensionFindMany = queryExtensionFindMany;
		this.validator = validator;
		this.factory = factory;
		this.cascadingDeletes = cascadingDeletes;
		this.addMessageToQueue = addMessageToQueue;
		this.logUserEvent = logUserEvent;
	}

	/**
	 *
	 *
	 * @param {*} { object, collName, query = null }
	 * @returns
	 * @memberof BaseResource
	 */
	async createOne({ object, query = null }) {
		try {
			if (!this.factory || !this.validator) {
				throw new Error("Missing factory or Validator for this model");
			}
			// construtor may or may not return promise
			const constructedObject = await this.factory(object, {
				isUpdating: false
			});

			// Validate
			const [validationError, value] = this.validator(
				{ data: constructedObject },
				{ isUpdating: false }
			);

			if (validationError) {
				validationError.statusCode = 422;
				throw new Error(validationError);
			}

			const [error, result] = await findOneAndUpdate({
				collName: this.collectionName,
				query: Object.assign({}, query || { name: value.name }, {
					deletedAt: null
				}),
				upsert: true,
				data: value
			});

			if (error) throw new Error(error);

			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async createOneNonIdempotent({ object, query = null }) {
		try {
			if (!this.factory || !this.validator) {
				throw new Error("Missing factory or Validator for this model");
			}
			// construtor may or may not return promise
			const constructedObject = await this.factory(object, {
				isUpdating: false
			});

			// Validate
			const [validationError, value] = this.validator(
				{ data: constructedObject },
				{ isUpdating: false }
			);

			if (validationError) {
				validationError.statusCode = 422;
				throw new Error(validationError);
			}
			const [error, result] = await insertOne({
				collName: this.collectionName,
				data: value
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { data }
	 * @param {*} { object } // this is the request body
	 * @returns
	 * @memberof BaseResource
	 */
	async insertMany({ data, object }) {
		try {
			const [error, result] = await insertMany({
				collName: this.collectionName,
				data
			});

			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async findMany({ query }) {
		const { queryPipeline } = new this.QueryBuilder({
			query,
			isPaginated: true
		}).processAndReturnQuery();
		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				query: [...this.queryExtensionFindMany, ...queryPipeline]
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async findOne({ query }) {
		const { queryPipeline } = new this.QueryBuilder({
			query,
			isPaginated: false
		}).processAndReturnQuery();
		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				query: [...this.queryExtensionFindOne, ...queryPipeline]
			});
			if (error) return [error, undefined];
			return [undefined, result[0] || {}];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { object, query }
	 * @returns
	 * @memberof BaseResource
	 */
	async updateOne({ object, query }) {
		try {
			if (!this.factory || !this.validator) {
				throw new Error("Missing factory or Validator for this model");
			}
			// construtor may or may not return promise
			const project = await this.factory(object, { isUpdating: true });
			// Validate
			const [validationError, value] = this.validator(
				{ data: project },
				{ isUpdating: true }
			);
			if (validationError) {
				validationError.statusCode = 422;
				return [validationError, undefined];
			}
			// Update record
			const [error, result] = await findOneAndUpdate({
				collName: this.collectionName,
				query,
				upsert: false,
				data: value
			});
			// End of message queue
			if (error) return [error, undefined];

			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async deleteOne({ query, object }) {
		try {
			const [error, result] = await deleteOne({
				collName: this.collectionName,
				query
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async deleteMany({ query }) {
		try {
			const [error, result] = await deleteMany({
				collName: this.collectionName,
				query
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = BaseResource;
