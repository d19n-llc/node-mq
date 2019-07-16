// Starts the node scheduler
require("./scheduler");

const { RunTests } = require("./tests");
const { CreateCollections } = require("./config/setup/install");
const { RemoveCollections } = require("./config/setup/uninstall");
const { SubscribeToPublisher } = require("./services/subscribe/subscribe");
const PublisherResourceClass = require("./resources/publisher");
const MessageQueuedResourceClass = require("./resources/message-queued");
const PublisherFactory = require("./models/publisher/factory");
const MessageFactory = require("./models/message/factory");
const SubscriberFactory = require("./models/subscriber/factory");

console.log("@d19n/node-mq is enabled");

try {
	const config = require(`${process.cwd()}/mq-config`);
	console.log({ config });
} catch (error) {
	console.log({ error });
}

module.exports = {
	PublisherFactory,
	SubscriberFactory,
	MessageFactory,
	MessageQueuedResourceClass,
	PublisherResourceClass,
	SubscribeToPublisher,
	CreateCollections,
	RemoveCollections,
	RunTests
};
