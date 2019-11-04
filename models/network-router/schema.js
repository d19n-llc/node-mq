const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.object().required()
		}),
		userAccountId: Joi.string()
			.optional()
			.allow(""),
		userId: Joi.string()
			.optional()
			.allow(""),
		subscriberUrl: Joi.string()
			.required()
			.allow(""),
		publisherUrl: Joi.string()
			.required()
			.allow(""),
		topics: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.array().required()
		}),
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
