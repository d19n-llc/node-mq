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
	const offSetInterval = randomizeTime(0, 600);
	const convertedToMs = Number(addTime) * 50;
	const delay = offSetInterval + convertedToMs;

	console.log({ delay });
	return new Promise((resolve) => setTimeout(resolve, delay));
};
