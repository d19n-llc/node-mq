const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.string().required()
		}),
		nodeId: Joi.string().required(),
		updatedAt: Joi.string().required(),
		createdAt: Joi.string().required()
	})
	.options({ stripUnknown: true });
