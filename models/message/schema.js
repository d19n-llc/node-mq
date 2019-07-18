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
		batchId: Joi.string()
			.optional()
			.allow(""),
		name: Joi.string().required(),
		source: Joi.string().required(),
		topic: Joi.string().required(),
		action: Joi.string().optional(),
		priority: Joi.number()
			.valid(0, 1, 2)
			.required(),
		maxRetries: Joi.number()
			.optional()
			.default(0),
		retriedCount: Joi.number()
			.optional()
			.default(0),
		payload: Joi.object().required(),
		error: Joi.object().optional(),
		updateTime: Joi.string().required(),
		createTime: Joi.string().required()
	})
	.options({ stripUnknown: true });
