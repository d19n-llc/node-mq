const Joi = require("@hapi/joi");

module.exports = Joi.object().keys({
	userAccountId: Joi.string()
		.optional()
		.allow(""),
	publisherUrl: Joi.string().required(),
	subscriberId: Joi.string().required(),
	lastMessageTime: Joi.string()
		.allow("")
		.optional(),
	updateTime: Joi.string().required(),
	createTime: Joi.string().required()
});
