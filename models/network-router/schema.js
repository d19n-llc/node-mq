const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.string().required()
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
		updateTime: Joi.string().required(),
		createTime: Joi.string().required()
	})
	.options({ stripUnknown: true });
