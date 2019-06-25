const moment = require("moment");

exports.utcDate = () => moment.utc().toISOString();
// Return an ISO string for timestamps
exports.currentDayIso = () => moment.utc().toISOString();

exports.addTimestamps = (params) => {
	const { isUpdating } = params;
	const timestamp = moment.utc().toISOString();
	if (isUpdating) {
		return {
			updateTime: timestamp
		};
	}
	return {
		createTime: timestamp,
		updateTime: timestamp
	};
};

exports.getDiffIndates = (dateA, dateB, interval) => {
	const firstDate = moment.utc(dateA); // today or past date
	const secondDate = moment.utc(dateB); // future date
	const diffIn = interval || "days";
	// OUTCOMES AND MEANING OF DIFFERENCE
	// firstDate diff from secondDate == Negative then secondDate is in the future
	// firstDate diff from secondDate == Positive then secondDate is in the past
	return firstDate.diff(secondDate, diffIn);
};
