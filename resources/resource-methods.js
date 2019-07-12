const {
	findOneAndUpdate,
	aggregate,
	deleteOne,
	findOne,
	insertMany
} = require("./mongo-methods");

module.exports = {
	async deleteOne({ collName, query }) {
		try {
			const [error, result] = await deleteOne({
				collName,
				query
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	},

	async findOne({ collName, query }) {
		try {
			const [error, result] = await findOne({
				collName,
				query
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	},

	async insertMany({ collName, data }) {
		try {
			const [error, result] = await insertMany({
				collName,
				data
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	},

	async aggregate({ collName, queryPipeline, pipelineExtension = [] }) {
		try {
			const [error, result] = await aggregate({
				collName,
				query: [...queryPipeline, ...pipelineExtension]
			});
			if (error) return [error, undefined];
			return [undefined, result];
		} catch (error) {
			return [error, undefined];
		}
	},

	// query param is optional
	async createOne({ object, collName, query = null }) {
		const { constructor, validate } = this;
		if (!constructor || !validate) {
			throw new Error("Missing constructor or Validator for this model");
		}
		// construtor may or may not return promise
		const constructedObject = await constructor(object, { isUpdating: false });
		// Validate
		const [validationError, value] = validate(
			{ data: constructedObject },
			{ isUpdating: false }
		);
		if (validationError) {
			validationError.statusCode = 422;
			return [validationError, undefined];
		}

		const [error, result] = await findOneAndUpdate({
			collName,
			query: query || { name: value.name },
			upsert: true,
			data: value
		});
		return [error, result];
	},
	async updateOne({ object, query, collName }) {
		const { constructor, validate } = this;
		if (!constructor || !validate) {
			throw new Error("Missing constructor or Validator for this model");
		}

		// construtor may or may not return promise
		const project = await constructor(object, { isUpdating: true });
		// Validate
		const [validationError, value] = validate(
			{ data: project },
			{ isUpdating: true }
		);

		if (validationError) {
			validationError.statusCode = 422;
			return [validationError, undefined];
		}
		const [error, result] = await findOneAndUpdate({
			collName,
			query,
			upsert: false,
			data: value
		});

		return [error, result];
	}
};
