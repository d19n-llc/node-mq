const NodeResourceClass = require("../../resources/node");
const claimMessages = require("../queue/claim");

module.exports = async () => {
	// Store the hostname, partition number an

	try {
		// Initatie resources
		const NodeResource = new NodeResourceClass();

		// Find all nodes
		// Consider how we should filter the findMany nodes to ensure we are only
		// Fetching healthy node that are active..
		const [findError, findResult] = await NodeResource.findMany({
			query: { sort: "1|partition|", resultsPerPage: 1000, pageNumber: 0 }
		});
		if (findError) throw new Error(findError);
		// Assign dockerId to messages in batches of 1000
		for (let index = 0; index < findResult.length; index++) {
			const node = findResult[index];
			const [claimError] = await claimMessages({
				nodeId: node.dockerId
			});

			if (claimError) throw new Error(claimError);
		}
	} catch (error) {
		console.error(error);
	}
};
