const os = require("os");
const NodeResourceClass = require("../../resources/node");
const { utcDate } = require("../../helpers/dates");

module.exports = async () => {
	// Store the hostname, partition number an
	try {
		const dockerId = os.hostname;
		const NodeResource = new NodeResourceClass();
		// Find all nodes
		const [findError, findResult] = await NodeResource.findMany({});
		if (findError) throw new Error(findError);
		// Increment partition
		const partition = findResult.length;
		console.log({ partition });
		const [createError, createResult] = await NodeResource.createOne({
			object: { dockerId, partition, lastActive: utcDate() }
		});
		console.log({ createError, createResult });
	} catch (error) {
		console.error(error);
	}
};
