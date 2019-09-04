const { currentDayIso, getDiffIndates } = require("./dates");
/**
 * To handle microservices that will start the job
 * at precisely the same time, this will provide a
 * ranodmized offset to when the jobs are processed.
 *
 * @returns
 */
module.exports.offsetJobStart = ({ addTime = 0 }) => {
	/**
	 * Returns a random number between min (inclusive) and max (exclusive)
	 * If the app is running in cluster mode the addTime  represents the
	 * appInstanceId and will be multiplied by 2000ms.
	 */
	const randomizeTime = (min, max) => Math.random() * (max - min) + min;
	const offSetInterval = randomizeTime(50, 100);
	const convertedToMs = Number(addTime) * 100;
	const delay = offSetInterval + convertedToMs;
	return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * check if the job is past the 15 second buffer
 * @returns
 */
module.exports.isPastQueueBuffer = (params) => {
	const { messageCreatedAt } = params;
	const currentTime = currentDayIso();
	const difference = getDiffIndates(
		currentTime,
		messageCreatedAt,
		"milliseconds"
	);
	// Adding a queue buffer of 3 seconds
	if (difference > 100) {
		return true;
	}
	return false;
};
