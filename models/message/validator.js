const Joi = require("@hapi/joi");

const jobSchema = Joi.object()
	.keys({
		userAccountId: Joi.string().optional(),
		// userAccountId: Joi.when("$update", {
		// 	is: true,
		// 	then: Joi.string().optional(),
		// 	otherwise: Joi.string().required()
		// }),
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.string().required()
		}),
		name: Joi.string().required(),
		source: Joi.string().required(),
		topic: Joi.string().required(),
		priority: Joi.number()
			.valid(0, 1, 2)
			.required(),
		retryOnFail: Joi.boolean()
			.optional()
			.default(false),
		totalRetries: Joi.number()
			.optional()
			.default(0),
		retriedCount: Joi.number()
			.optional()
			.default(0),
		payload: Joi.object().required(),
		batchId: Joi.string()
			.optional()
			.allow(""),
		updateTime: Joi.string().required(),
		createTime: Joi.string().required()
	})
	.options({ stripUnknown: true });

/**
 *
 *
 * @param {Function} callback
 * @param {Array or Object} data
 * @param {Object} options
 */
module.exports.validate = (params, options, callback) => {
	const { data } = params;
	const { isUpdating } = options;

	// Set the validation schema for a single object or an array of objects
	const schema = Array.isArray(data) ? Joi.array().items(jobSchema) : jobSchema;
	// validate the data against the schema
	Joi.validate(
		data,
		schema,
		{ context: { update: isUpdating } },
		(err, value) => {
			if (err) return callback(err, null);
			return callback(null, value);
		}
	);
};
