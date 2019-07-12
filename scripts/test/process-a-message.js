module.exports = ({ message }) => {
	try {
		if (message.payload && message.payload.shouldFail) {
			throw new Error("This message was set to fail and was not processed.");
		}
		return [undefined, message];
	} catch (error) {
		return [error, undefined];
	}
};
