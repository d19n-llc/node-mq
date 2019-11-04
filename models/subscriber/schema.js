const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		userAccountId: Joi.string()
			.optional()
			.allow(""),
		userId: Joi.string()
			.optional()
			.allow(""),
		subscriberUrl: Joi.string().required(),
		topics: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.array().required()
		}),
		lastUpdateError: Joi.string()
			.optional()
			.allow(""),
		lastupdatedAt: Joi.string()
			.optional()
			.allow(""),
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
