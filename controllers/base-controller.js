const ObjectID = require("mongodb").ObjectID;
const { makeError, clientErrorHandler } = require("../helpers/errors");

class BaseController {
	constructor({ resourceModule }) {
		if (!resourceModule) throw new Error("No resource module provided");
		this.resourceModule = resourceModule;
		this.findMany = this.findMany.bind(this);
		this.createOne = this.createOne.bind(this);
		this.findOne = this.findOne.bind(this);
		this.deleteOne = this.deleteOne.bind(this);
		this.updateOne = this.updateOne.bind(this);
	}

	async createOne(request, response, next) {
		try {
			const { body } = request;
			const [error, result] = await this.resourceModule.createOne({
				object: body
			});
			if (error) {
				return clientErrorHandler(makeError(error), response);
			}
			return response.status(200).json(result);
		} catch (error) {
			return clientErrorHandler(makeError(error), response);
		}
	}

	async findMany(request, response, next) {
		try {
			const { query } = request;
			const [error, result] = await this.resourceModule.findMany({
				query
			});
			if (error) {
				return clientErrorHandler(makeError(error), response);
			}
			// this means that a facet response is returned
			if (result && result.metaData) {
				return response.status(200).json({
					data: result.data,
					metaData: result.metaData || { count: 0, totalPages: 0 } // if there are no documents, metaData array will be empty
				});
			}
			return response.status(200).json(result);
		} catch (error) {
			return clientErrorHandler(makeError(error), response);
		}
	}

	async findOne(request, response, next) {
		try {
			const { params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.findOne({
				query: { _id: ObjectID(id) }
			});
			if (error) {
				return clientErrorHandler(makeError(error), response);
			}

			return response.status(200).json(result);
		} catch (error) {
			return clientErrorHandler(makeError(error), response);
		}
	}

	async deleteOne(request, response, next) {
		const { body } = request;
		try {
			const { params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.deleteOne({
				query: { _id: ObjectID(id) },
				object: body
			});
			if (error) {
				return clientErrorHandler(makeError(error), response);
			}
			return response.status(200).json(result);
		} catch (error) {
			return clientErrorHandler(makeError(error), response);
		}
	}

	async updateOne(request, response, next) {
		try {
			const { body, params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.updateOne({
				object: body,
				query: { _id: ObjectID(id) }
			});
			if (error) return next(makeError(error));
			return response.status(200).json(result);
		} catch (error) {
			return clientErrorHandler(makeError(error), response);
		}
	}
}

module.exports = BaseController;
