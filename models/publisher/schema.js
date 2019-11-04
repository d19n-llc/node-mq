const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		userAccountId: Joi.string()
			.optional()
			.allow(""),
		userId: Joi.string()
			.optional()
			.allow(""),
		publisherUrl: Joi.string().required(),
		subscriberId: Joi.string().required(),
		lastMessageTime: Joi.string()
			.allow("")
			.optional(),
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
