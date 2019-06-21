const ObjectID = require("mongodb").ObjectID;
const { addTimestamps } = require("../../helpers/dates");

module.exports.constructor = (params, options) => {
	const { isUpdating } = options;
	const defaults = isUpdating
		? // isUpdating = true do not set default values
		  {}
		: // isUpdating = false set default values
		  {
				userAccountId: "",
				_id: ObjectID().toString(),
				batchId: "", // added at the time the message is processed from the queue
				name: "", // a unique identifier for the message
				source: "",
				topic: "", // provides context for the payload
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
