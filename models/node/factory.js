const { addTimestamps } = require("../../helpers/dates");

module.exports = (params, options) => {
	const { isUpdating } = options;

	const defaults = isUpdating
		? // isUpdating = true do not set default values
		  {}
		: // isUpdating = false set default values
		  {
				nodeId: null
		  };

	// Merge values being passed in the params object with the defaults
	const merged = Object.assign(
		{},
		defaults,
		params,
		addTimestamps({ isUpdating: false })
	);
	// Freeze the object
	return Object.freeze({
		...merged
	});
};
