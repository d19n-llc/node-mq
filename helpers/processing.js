const { currentDayIso, getDiffIndates } = require("./dates");
/**
 * To handle microservices that will start the job
 * at precisely the same time, this will provide a
 * ranodmized offset to when the jobs are processed.
 *
 * @returns
 */
module.exports.offsetJobStart = () => {
	/**
	 * Returns a random number between min (inclusive) and max (exclusive)
	 */
	const randomizeTime = (min, max) => Math.random() * (max - min) + min;
	const offSetInterval = randomizeTime(0, 50000);
	return new Promise((resolve) => setTimeout(resolve, offSetInterval));
};

/**
 * check if the job has been queued for 2 min before processing
 * @returns
 */
module.exports.isPastQueueBuffer = (params) => {
	const { jobCreatedAt } = params;
	const currentTime = currentDayIso();
	const difference = getDiffIndates(currentTime, jobCreatedAt, "minutes");
	if (difference > 1) {
		return true;
	}
	return false;
};
