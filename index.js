// Starts the node scheduler
require("./scheduler");

const { CreateCollections } = require("./config/setup/install");
const { RemoveCollections } = require("./config/setup/uninstall");

console.log("@d19n/node-mq is enabled");

try {
	const scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	console.log({ scriptRegistry });
} catch (error) {
	console.log({ error });
}

module.exports = {
	CreateCollections,
	RemoveCollections
};
