const ObjectID = require("mongodb").ObjectID;
const { addTimestamps } = require("../../helpers/dates");

module.exports = (params, options) => {
	const { isUpdating } = options;
	const defaults = isUpdating
		? // isUpdating = true do not set default values
		  {}
		: // isUpdating = false set default values
		  {
				_id: ObjectID().toString(),
				userAccountId: null,
				userId: null,
				batchId: null, // added at the time the message is processed from the queue
				externalId: null, // Id for the topic of the message
				name: null, // a unique identifier for the message
				source: null,
				status: null,
				topic: null, // provides context for the payload
				action: null, // created, updated, deleted, nofification
				priority: 0, // 0,1,2 messages are prioritised descending 0-low, 1-med, 2-high
				maxRetries: 3,
				retriedCount: 0,
				payload: {}, // The data being processed
				error: {}
		  };

	// Merge values being passed in the params object with the defaults
	const merged = Object.assign(
		{},
		defaults,
		params,
		addTimestamps({ isUpdating })
	);
	// Freeze the object
	return Object.freeze({
		...merged
	});
};
