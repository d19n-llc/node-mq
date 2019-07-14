const retryFailedMessages = require("../services/retry-failed/index");

module.exports = async (params = {}) => {
	try {
		const [error, result] = await retryFailedMessages({ removeBuffer: true });
		if (error) throw new Error(error);
		return [undefined, result];
	} catch (error) {
		return [error, undefined];
	}
};
