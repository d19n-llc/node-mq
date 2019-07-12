const Joi = require("@hapi/joi");
const schema = require("./schema");
/*
 *
 * @param {Function} callback
 * @param {Array or Object} data
 * @param {Object} options
 */
module.exports = (params, options) => {
	const { data } = params;
	const { isUpdating } = options;
	// Set the validation schema for a single object or an array of objects
	const schemaObject = Array.isArray(data) ? Joi.array().items(schema) : schema;
	// validate the data against the schema
	// results structure is {error, value} https://github.com/hapijs/joi
	const { error, value } = Joi.validate(data, schemaObject, {
		context: { update: isUpdating }
	});
	return [error, value];
};
