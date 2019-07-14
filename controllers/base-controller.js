class BaseController {
	constructor({ resourceModule }) {
		if (!resourceModule) throw new Error("No resource module provided");
		this.resourceModule = resourceModule;
		this.findMany = this.findMany.bind(this);
		this.createOne = this.createOne.bind(this);
		this.findOne = this.findOne.bind(this);
		this.deleteOne = this.updateOne.bind(this);
		this.updateOne = this.updateOne.bind(this);
	}

	async createOne(request, response, next) {
		try {
			const { body } = request;
			console.log(process.cwd(), { body });
			const [error, result] = await this.resourceModule.createOne({
				object: body
			});
			if (error) {
				return next(error);
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}

	async findMany(request, response, next) {
		try {
			const { query } = request;
			const [error, result] = await this.resourceModule.aggregate({
				query
			});
			if (error) {
				return next(error);
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(error);
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
				return next(error);
			}
			return response.status(200).json(result[0]);
		} catch (error) {
			return next(error);
		}
	}

	async deleteOne(request, response, next) {
		try {
			const { body } = request;
			const [error, result] = await this.resourceModule.createOne({
				object: body
			});
			if (error) {
				return next(error);
			}
			return response.status(200).json(result);
		} catch (error) {
			return next(error);
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
			if (error) return next(error);
			return response.status(200).json(result);
		} catch (error) {
			return next(error);
		}
	}
}

module.exports = BaseController;
