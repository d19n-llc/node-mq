const { asyncForLoop } = require("../helpers/functions");
const createMessages = require("./create-messages");
const processMessages = require("./process-messages");
const retryMessages = require("./retry-messages");
const deleteMessages = require("./delete-messages");
const electNodes = require("../services/nodes/register");

// node -e 'require("./tests").RunTests()'

module.exports.RunTests = async () => {
	try {
		const [seedError, seedResult] = await createMessages();
		await electNodes();

		if (seedError) throw new Error(seedError);
		let processResponse;
		let retryResponse;
		// test that the failed messages are retried for the total maxRetries count
		await asyncForLoop({ total: 30, incrementBy: 1 }, async (doc, index) => {
			const [processError, processResult] = await processMessages({});
			console.log({ processResult });
			if (processError) throw new Error(processError);
			processResponse = processResult;

			const [retryError, retryResult] = await retryMessages({});
			console.log({ retryResult });
			if (retryError) throw new Error(retryError);
			retryResponse = retryResult;
		});

		const [deleteError, deleteResult] = await deleteMessages({});
		console.log({ deleteResult });
		if (deleteError) throw new Error(deleteError);

		return [
			undefined,
			{ seedResult, processResponse, retryResponse, deleteResult }
		];
	} catch (error) {
		console.error(error);
		return [error, undefined];
	}
};
