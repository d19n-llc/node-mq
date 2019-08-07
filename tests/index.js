const { asyncForLoop } = require("../helpers/functions");
const createMessages = require("./create-messages");
const processMessages = require("./process-messages");
const retryMessages = require("./retry-messages");
const deleteMessages = require("./delete-messages");

// node -e 'require("./tests").RunTests()'

module.exports.RunTests = async () => {
	try {
		const [seedError, seedResult] = await createMessages();
		if (seedError) throw new Error(seedError);
		let processResponse;
		let retryResponse;
		// test that the failed messages are retried for the total maxRetries count
		await asyncForLoop({ total: 4, incrementBy: 1 }, async (doc, index) => {
			const [processError, processResult] = await processMessages({});
			if (processError) throw new Error(processError);
			processResponse = processResult;
			console.log("PROCESSED MESSAGES");

			const [retryError, retryResult] = await retryMessages({});
			if (retryError) throw new Error(retryError);
			retryResponse = retryResult;
			console.log("RETRIED MESSAGES");
		});

		const [deleteError, deleteResult] = await deleteMessages({});
		if (deleteError) throw new Error(deleteError);
		console.log("DELETED MESSAGES");
		return [
			undefined,
			{ seedResult, processResponse, retryResponse, deleteResult }
		];
	} catch (error) {
		console.log("error", error);
		return [error, undefined];
	}
};
