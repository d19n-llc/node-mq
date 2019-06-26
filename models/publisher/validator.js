const Joi = require("@hapi/joi");

const publisherSchema = Joi.object().keys({
	userAccountId: Joi.string().optional(),
	_id: Joi.when("$update", {
		is: true,
		then: Joi.strip(),
		otherwise: Joi.string().required()
	}),
	publisherUrl: Joi.string().required(),
	subscriberId: Joi.string().required(),
	lastMessageTime: Joi.string()
		.allow("")
		.optional(),
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
	const { data } = params;
	const { isUpdating } = options;
	// Set the validation schema for a single object or an array of objects
	const schema = Array.isArray(data)
		? Joi.array().items(publisherSchema)
		: publisherSchema;
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
