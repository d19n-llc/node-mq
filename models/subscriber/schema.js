const Joi = require("@hapi/joi");

module.exports = Joi.object().keys({
	userAccountId: Joi.string()
		.optional()
		.allow(""),
	_id: Joi.when("$update", {
		is: true,
		then: Joi.strip(),
		otherwise: Joi.string().required()
	}),
	subscriberUrl: Joi.string().required(),
	topics: Joi.when("$update", {
		is: true,
		then: Joi.strip(),
		otherwise: Joi.array().required()
	}),
	lastUpdateError: Joi.object().optional(),
	updateTime: Joi.string().required(),
	createTime: Joi.string().required()
});
