const os = require("os");
const NodeResourceClass = require("../../resources/node");
const claimMessages = require("../queue/claim");

module.exports = async () => {
	// Store the hostname, partition number an

	try {
		// Initatie resources
		const NodeResource = new NodeResourceClass();

		const dockerId = os.hostname;
		const appInstanceId = process.env.INSTANCE_ID || 0;
		const nodeId = `${dockerId}-${appInstanceId}`;

		// Find all nodes
		// Consider how we should filter the findMany nodes to ensure we are only
		// Fetching healthy node that are active..
		const [findError, findResult] = await NodeResource.findMany({
			query: { sort: "-1|updatedAt|", resultsPerPage: 1000, pageNumber: 0 }
		});
		if (findError) throw new Error(findError);

		// If there are nodes
		if (findResult.data && findResult.data.length > 0) {
			// if the node is the master assign messages to all nodes
			if (findResult.data[0].nodeId === nodeId) {
				// Assign nodeId to messages in batches of 1000
				for (let index = 0; index < findResult.data.length; index++) {
					const node = findResult.data[index];
					const [claimError] = await claimMessages({
						nodeId: node.nodeId
					});
					if (claimError) throw new Error(claimError);
				}
			}
		}
		return;
	} catch (error) {
		console.error(error);

		return "error assigning nodes";
	}
};
