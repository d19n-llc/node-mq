const os = require("os");
const NodeResourceClass = require("../../resources/node");
const { utcDate } = require("../../helpers/dates");
const {offsetJobStart} = require("../../helpers/processing");

module.exports = async () => {
	// Store the hostname, partition number an
	try {
		const dockerId = os.hostname;
		const appInstanceId = process.env.INSTANCE_ID || 0;
		const nodeId = `${dockerId}-${appInstanceId}`;

		const NodeResource = new NodeResourceClass();

		// add a delay
		 await offsetJobStart({ addTime: appInstanceId});
		//
		const [createError ] = await NodeResource.createOne({
			object: {
				nodeId,
				lastActive: utcDate()
			}
		});
		if (createError) throw new Error(createError);
		return "election process complete";
	} catch (error) {
		console.error(error);
		return "error electing nodes";
	}
};
