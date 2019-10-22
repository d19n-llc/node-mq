// Starts the node scheduler
require("./scheduler");

const { RunTests } = require("./tests");
const { CreateCollections } = require("./config/setup/install");
const { RemoveCollections } = require("./config/setup/uninstall");
const NodeResourceClass = require("./resources/node");
const PublisherResourceClass = require("./resources/publisher");
const MessageQueuedResourceClass = require("./resources/message-queued");
const PublisherFactory = require("./models/publisher/factory");
const MessageFactory = require("./models/message/factory");
const SubscriberFactory = require("./models/subscriber/factory");

try {
	const config = require(`${process.cwd()}/mq-config`);
} catch (error) {
	console.error(error);
}

console.log("message queu is running");

module.exports = {
	PublisherFactory,
	SubscriberFactory,
	MessageFactory,
	MessageQueuedResourceClass,
	PublisherResourceClass,
	NodeResourceClass,
	CreateCollections,
	RemoveCollections,
	RunTests
};
