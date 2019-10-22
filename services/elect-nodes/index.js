const os = require("os");
const NodeResourceClass = require("../../resources/node");
const { utcDate } = require("../../helpers/dates");

module.exports = async () => {
	// Store the hostname, partition number an
	try {
		const dockerId = os.hostname;
		const appInstanceId = process.env.INSTANCE_ID || 0;
		const nodeId = `${dockerId}-${appInstanceId}`;

		const NodeResource = new NodeResourceClass();
		// Find all nodes
		const [createError, createResult] = await NodeResource.createOne({
			object: {
				nodeId,
				lastActive: utcDate()
			}
		});
		console.log({ createError, createResult });
	} catch (error) {
		console.error(error);
	}
};
