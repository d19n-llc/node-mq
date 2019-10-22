const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.string().required()
		}),
		nodeId: Joi.string().required(),
		partition: Joi.string().required(),
		lastActive: Joi.string()
			.optional()
			.allow(null),
		updatedAt: Joi.string().required(),
		createdAt: Joi.string().required()
	})
	.options({ stripUnknown: true });
