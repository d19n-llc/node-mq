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
		subscriberUrl: Joi.string().required(),
		topics: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.array().required()
		}),
		lastUpdateError: Joi.string()
			.optional()
			.allow(""),
		lastUpdateTime: Joi.string()
			.optional()
			.allow(""),
		updateTime: Joi.string().required(),
		createTime: Joi.string().required()
	})
	.options({ stripUnknown: true });
