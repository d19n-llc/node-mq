const { makeError } = require("../helpers/errors");

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
				return next(makeError(error));
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(makeError(error));
		}
	}

	async findMany(request, response, next) {
		try {
			const { query } = request;
			const [error, result] = await this.resourceModule.findMany({
				query
			});
			if (error) {
				return next(makeError(error));
			}
			// this means that a facet response is returned
			if (result[0] && result[0].metaData) {
				return response.status(200).json({
					data: result[0].data,
					metaData: result[0].metaData[0] || { count: 0, totalPages: 0 } // if there are no documents, metaData array will be empty
				});
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(makeError(error));
		}
	}

	async findOne(request, response, next) {
		try {
			const { params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.findOne({
				query: { _id: id }
			});
			if (error) {
				return next(makeError(error));
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(makeError(error));
		}
	}

	async deleteOne(request, response, next) {
		const { body } = request;
		try {
			const { params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.deleteOne({
				query: { _id: id },
				object: body
			});
			if (error) {
				return next(makeError(error));
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(makeError(error));
		}
	}

	async updateOne(request, response, next) {
		try {
			const { body, params } = request;
			const { id } = params;
			const [error, result] = await this.resourceModule.updateOne({
				object: body,
				query: { _id: id }
			});
			if (error) return next(makeError(error));
			return response.status(200).json(result);
		} catch (error) {
			return next(makeError(error));
		}
	}
}

module.exports = BaseController;
