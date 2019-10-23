const Joi = require("@hapi/joi");

module.exports = Joi.object()
	.keys({
		_id: Joi.when("$update", {
			is: true,
			then: Joi.strip(),
			otherwise: Joi.string().required()
		}),
		userAccountId: Joi.string()
			.allow(null)
			.optional(),
		userId: Joi.string()
			.allow(null)
			.optional(),
		externalId: Joi.string()
			.allow(null)
			.optional(),
		name: Joi.when("$update", {
			is: true,
			then: Joi.string().optional(),
			otherwise: Joi.string().required()
		}),
		isPublishable: Joi.when("$update", {
			is: true,
			then: Joi.boolean().optional(),
			otherwise: Joi.boolean().required()
		}),
		status: Joi.string()
			.allow(null)
			.optional(),
		source: Joi.when("$update", {
			is: true,
			then: Joi.string().optional(),
			otherwise: Joi.string().required()
		}),
		topic: Joi.when("$update", {
			is: true,
			then: Joi.string().optional(),
			otherwise: Joi.string().required()
		}),
		action: Joi.when("$update", {
			is: true,
			then: Joi.string().optional(),
			otherwise: Joi.string().required()
		}),
		priority: Joi.when("$update", {
			is: true,
			then: Joi.number()
				.valid(0, 1, 2)
				.optional(),
			otherwise: Joi.number()
				.valid(0, 1, 2)
				.required()
		}),
		maxRetries: Joi.number().optional(),
		retriedCount: Joi.number().optional(),
		payload: Joi.when("$update", {
			is: true,
			then: Joi.object().optional(),
			otherwise: Joi.object().required()
		}),
		error: Joi.object().optional(),
		nodeId: Joi.string()
			.allow(null)
			.optional(),
		assignedAt: Joi.when("$update", {
			is: true,
			then: Joi.string()
				.allow(null)
				.optional(),
			otherwise: Joi.string()
				.allow(null)
				.required()
		}),
		processedAt: Joi.when("$update", {
			is: true,
			then: Joi.string()
				.allow(null)
				.optional(),
			otherwise: Joi.string()
				.allow(null)
				.required()
		}),
		updatedAt: Joi.string().required(),
		createdAt: Joi.when("$update", {
			is: true,
			then: Joi.string().optional(),
			otherwise: Joi.string().required()
		}),
		updatedAtConverted: Joi.object().required(),
		createdAtConverted: Joi.when("$update", {
			is: true,
			then: Joi.object().optional(),
			otherwise: Joi.object().required()
		})
	})
	.options({ stripUnknown: true });
