// Starts the node scheduler
require("./scheduler");

const { CreateCollections } = require("./config/setup/install");
const { RemoveCollections } = require("./config/setup/uninstall");
const { RunTests } = require("./tests");
const messageQueue = require("./resources/message-queued");
const messageConstructor = require("./models/message/constructor");
const subscriberConstructor = require("./models/subscriber/constructor");

console.log("@d19n/node-mq is enabled");

try {
	const scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	console.log({ scriptRegistry });
} catch (error) {
	console.log({ error });
}

module.exports = {
	Subscriber: subscriberConstructor,
	Message: messageConstructor,
	AddMessageToQueue: messageQueue.createOne,
	CreateCollections,
	RemoveCollections,
	RunTests
};
