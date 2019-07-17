// const { Message, AddMessageToQueue } = require("@d19n/node-mq");
// const { utcDate } = require("../helpers/dates");
const {
	findOneAndUpdate,
	aggregate,
	deleteOne,
	deleteMany,
	insertMany
} = require("./mongo-methods");

class BaseResource {
	constructor({
		collectionName,
		queryBuilder,
		queryExtensionFindOne = [],
		queryExtensionFindMany = [],
		validator,
		factory
	}) {
		if (!collectionName) throw new Error("No coll name provided");
		if (!queryBuilder) throw new Error("No query builder provided");
		if (!validator) throw new Error("No validator provided");
		if (!factory) throw new Error("No factory module provided");

		this.collectionName = collectionName;
		this.queryBuilder = queryBuilder;
		this.queryExtensionFindOne = queryExtensionFindOne;
		this.queryExtensionFindMany = queryExtensionFindMany;
		this.validator = validator;
		this.factory = factory;
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
				query: query || { name: value.name },
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
	 * @param {*} { data }
	 * @returns
	 * @memberof BaseResource
	 */
	async insertMany({ data }) {
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
		const { queryPipeline } = this.queryBuilder({ query });
		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				query: [...queryPipeline, ...this.queryExtensionFindMany]
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
	async findOne({ query }) {
		const { queryPipeline } = this.queryBuilder({ query });
		try {
			const [error, result] = await aggregate({
				collName: this.collectionName,
				query: [...queryPipeline, ...this.queryExtensionFindOne]
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
				throw new Error(validationError);
			}
			// Update record
			const [error, result] = await findOneAndUpdate({
				collName: this.collectionName,
				query,
				upsert: false,
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
	async deleteOne({ query }) {
		try {
			const [error, result] = await deleteOne({
				collName: this.collectionName,
				query
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
	async deleteMany({ query }) {
		try {
			const [error, result] = await deleteMany({
				collName: this.collectionName,
				query
			});

			if (error) throw new Error(error);
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	}
}

module.exports = BaseResource;
