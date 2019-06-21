const Joi = require("@hapi/joi");

const subscriberSchema = Joi.object().keys({
	userAccountId: Joi.string().optional(),
	subscriberUrl: Joi.string().required(),
	topics: Joi.array().required(),
	updateTime: Joi.string().required(),
	createTime: Joi.string().required()
});

/**
 *
 *
 * @param {Function} callback
 * @param {Array or Object} data
 * @param {Object} options
 */
module.exports.validate = (params, options, callback) => {
	console.log({ callback, params, options });
	const { data } = params;
	const { isUpdating } = options;
	console.log({ isUpdating });
	// Set the validation schema for a single object or an array of objects
	const schema = subscriberSchema;
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
