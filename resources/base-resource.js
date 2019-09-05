const {
	insertOne,
	findOneAndUpdate,
	aggregate,
	deleteOne,
	insertMany,
	deleteMany,
	updateMany
} = require("./mongo-methods");
const { makeError } = require("../helpers/errors");

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

			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async createOneNonIdempotent({ object }) {
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

			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
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

			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { query }
	 * @returns
	 * @memberof BaseResource
	 */
	async findMany({ query, isPaginated = true }) {
		const { queryPipeline } = new this.QueryBuilder({
			query,
			queryExtension: this.queryExtensionFindMany,
			isPaginated
		}).processAndReturnQuery();

		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				// You cannot have multiple $facet pipelines in a single query
				query: queryPipeline
			});

			if (error) return [error, undefined];

			if (isPaginated) {
				const sanitizedResult = Object.assign({}, result[0], {
					metaData: result[0].metaData[0] || {}
				});

				return [undefined, sanitizedResult];
			}
			return [undefined, result[0]];
		} catch (error) {
			return [makeError(error), undefined];
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
			queryExtension: this.queryExtensionFindOne,
			isPaginated: false
		}).processAndReturnQuery();

		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				query: queryPipeline
			});

			if (error) return [error, undefined];
			return [undefined, result[0] ? result[0].data[0] : {}];
		} catch (error) {
			return [makeError(error), undefined];
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
			const factoryObject = await this.factory(object, { isUpdating: true });
			// Validate
			const [validationError, value] = this.validator(
				{ data: factoryObject },
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
			if (error) return [makeError(error), undefined];

			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
		}
	}

	/**
	 *
	 *
	 * @param {*} { object, query }
	 * @returns
	 * @memberof BaseResource
	 */
	async updateMany({ object, query }) {
		try {
			if (!this.factory || !this.validator) {
				throw new Error("Missing factory or Validator for this model");
			}
			// construtor may or may not return promise
			const factoryObject = await this.factory(object, { isUpdating: true });

			// Validate
			const [validationError, value] = this.validator(
				{ data: factoryObject },
				{ isUpdating: true }
			);

			if (validationError) {
				validationError.statusCode = 422;
				throw new Error(validationError);
			}

			// Update record
			const [error, result] = await updateMany({
				collName: this.collectionName,
				query,
				data: value
			});

			// End of message queue
			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
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
			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
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
			if (error) return [makeError(error), undefined];
			return [undefined, result];
		} catch (error) {
			return [makeError(error), undefined];
		}
	}
}

module.exports = BaseResource;
