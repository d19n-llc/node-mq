const retryFailedMessages = require("../services/retry-failed/index");

module.exports = async (params = {}) => {
	try {
		const result = await retryFailedMessages({ removeBuffer: true });
		console.log({ result });
		// if (error) throw new Error(error);
		return [undefined, result];
	} catch (error) {
		console.log({ path: process.cwd(), error });
		return [error, undefined];
	}
};
