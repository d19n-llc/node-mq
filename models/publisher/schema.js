const Joi = require("@hapi/joi");

module.exports = Joi.object().keys({
	userAccountId: Joi.string().optional(),
	_id: Joi.when("$update", {
		is: true,
		then: Joi.strip(),
		otherwise: Joi.string().required()
	}),
	publisherUrl: Joi.string().required(),
	subscriberId: Joi.string().required(),
	lastMessageTime: Joi.string()
		.allow("")
		.optional(),
	updateTime: Joi.string().required(),
	createTime: Joi.string().required()
});
