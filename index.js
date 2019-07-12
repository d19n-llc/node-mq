// Starts the node scheduler
require("./scheduler");

const { CreateCollections } = require("./config/setup/install");
const { RemoveCollections } = require("./config/setup/uninstall");
const { RunTests } = require("./tests");
const PublisherResourceClass = require("./resources/publisher");
const QueueResourceClass = require("./resources/message-queued");
const PublisherFactory = require("./models/publisher/factory");
const MessageFactory = require("./models/message/factory");
const SubscriberFactory = require("./models/subscriber/factory");

const QueueResource = new QueueResourceClass();
const PublisherResource = new PublisherResourceClass();

console.log("@d19n/node-mq is enabled");

try {
	const scriptRegistry = require(`${process.cwd()}/mq-scripts`);
	console.log({ scriptRegistry });
} catch (error) {
	console.log({ error });
}

module.exports = {
	Publisher: PublisherFactory,
	Subscriber: SubscriberFactory,
	Message: MessageFactory,
	AddMessageToQueue: QueueResource.createOne,
	AddPublisher: PublisherResource.createOne,
	CreateCollections,
	RemoveCollections,
	RunTests
};
