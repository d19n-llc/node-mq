const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		nodeId: Joi.string().required(),
		updatedAt: Joi.string().required(),
		createdAt: Joi.string().required(),
		updatedAtConverted: Joi.object().required(),
		createdAtConverted: Joi.when("$update", {
			is: true,
			then: Joi.object().optional(),
			otherwise: Joi.object().required()
		})
	})
	.options({ stripUnknown: true });
