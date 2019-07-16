# Nodejs Pub / Sub Message Queu For Microservices

API Documentation can be found here:
https://documenter.getpostman.com/view/3524007/S1a4X7BT

A distributed messaging queue built for Node.js/express applications and designed
for a horizontally scalling micro service architecture. You can have
applications running in clusters and on multiple servers working to satisfy
the queued messages, scale your apps horizontally and the node-mq handles
deduplication and batching to prevent processing a message more than once.

When deploying a new application into your network, install the node-mq package,
then subscribe to other micro services using this package.

Road Map:

1. Lightweight interface to monitor / manage the queue.
2. Sync with publishers after a service outage. This will batch fetch
   all messages after the last recieved message from all publishers.

## Getting Started

1.) yarn add @d19n/node-mq or npm install @d19n/node-mq

2.) import the package in your server.js file

```
require("@d19n/node-mq);

```

3.) add the mongodb url and database name in your .env file

```
MQ_MONGODB_URL=mongodb+srv://<user></user>:<password></password>@test-nbfdp.mongodb.net/test?retryWrites=true&w=majority
MQ_MONGODB_NAME=<db_name>
MQ_API_ACCESS_TOKEN=<HEADER_ACCESS_TOKEN>

```

4.) The message queue exports routes for you to use in your app. Our routes/index.js
file is setup to merge routers into a single app router. An example is below for
how we merge routers.

Copy & Paste the following express routers to your routes **index.js** file. You
can see an example of how we export a route file.
https://github.com/FTruglio/d19n-node-mq/blob/01ee47c4437bcf58654e6a52d61b5046e81b51ef/routes/publisher/index.js

```
const express = require("express");

const router = express.Router();

const mqQueuedRouter = require("@d19n/node-mq/routes/message-queued");
const mqInflightRouter = require("@d19n/node-mq/routes/message-inflight");
const mqFailedRouter = require("@d19n/node-mq/routes/message-failed");
const mqProcessedRouter = require("@d19n/node-mq/routes/message-processed");
const mqPublisherRouter = require("@d19n/node-mq/routes/publisher");
const mqSubscriberRouter = require("@d19n/node-mq/routes/subscriber");

const combineRouters = [
  mqQueuedRouter,
  mqInflightRouter,
  mqFailedRouter,
  mqProcessedRouter,
  mqPublisherRouter,
  mqSubscriberRouter,
  ...other routers
].reduce((newArray, elem) => [...newArray, ...elem.stack], []);

router.stack = combineRouters;
module.exports = router;
```

6.) Create a file in your root directory named **"mq-config.js"** and register
all the scripts that you want to have the mq run when messages are added to the queue.
the message queue will import this file to access all scripts registered by topic.

Set the key equal to the message "topic" for your script to be processed.
The value is the module you want the queue processor to run when a message
with the topic matches the key in your mq-config.js file.

```
const handleJobMessages = require("path/to/script");
const handleProjectMessages = require("path/to/script");
const handleProgrammessages = require("path/to/script");
const handleCustomJob1 = require("path/to/script");
const handleCustomJob2 = require("path/to/script");

// [topic]: function()
module.exports.messageHandlers = {
  jobs: handleJobMessages,
  projects: handleProjectMessages,
  programs: handleProgrammessages,
  customJob1: handleCustomJob1,
  customJob2: handleCustomJob2,
};

module.exports.httpHeaders = {
	Authorisation: process.env.AUTH_TOKEN,
	"X-Custom-Header": "<CUSTOM_HEADER_VALUE>"
}
```

Example of the http headers in the message queue. Make sure your nginx config
allows [ x-request-source, Content-type, Accept ] headers or requests might fail.

```
headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-request-source": "node-mq",
    ...httpHeaders
  },

```

7.) To create a pub / sub relationship with another micro service using the
@d19n/node-mq package. you can run the following command from the root directory
of your project.

```
node -e 'require("@d19n/node-mq").SubscribeToPublisher({publisherUrl: "http://localhost:8080", topics: ["programs", "projects", "jobs"]})'

```

8.) If you want to process custom scripts. You can register a script with a "key".
equal to the topic name of the message. Then add a message to the queue when
ever you want the script processed.

When a script is processed the queue will pass a message to your script.

```
module.exports = ({ message }) => {
	console.log("In your registered module", {
    message: {
      name: "", // a unique identifier for the message
      source: process.env.APP_URL, // source of the message
      topic: "", // provides context for the payload
      action: "", // ["created", "updated", "deleted", "notification"]
      priority: 0, // 0,1,2 messages are prioritised descending 0-low, 1-med, 2-high
      maxRetries: 3,
      payload: {}, // The data to be processed
    }
  });
  function handleMessage(){
    // Your custom code here to process a message
  }
	return [undefined, { message }];
};

```

## Publishing a message

1.) To create a scheduled Job. Create a message with the "topic" for a script you
want to run i.e "customJob1". This message will run a script registered with the key
"customJob1". see #6 on registering a script.

```
const { MessageFactory, MessageQueuedResourceClass } = require("@d19n/node-mq");

const MessageQueueResource = new MessageQueuedResourceClass();

MessageFactory(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
    name: `custom-job-one`,
    topic: "customJob1",
    source: process.env.APP_URL,
    action: "create",
    payload: {
      description: "Running a custom job script",
    },
    priority: 1
  },
  { isUpdating: false }
);

const [error, result ] = await MessageQueueResource.createOne({object: message});
console.log({error, result});

```

2.) If you want to publish a message that is sent to all subscribers. Add a message
with the source: process.env.APP_NAME. And the topic can be anything you want. In
the case of data replication we set the topic: "Entity" i.e (programs, projects, jobs)

```
const { MessageFactory, MessageQueuedResourceClass } = require("@d19n/node-mq");

const MessageQueueResource = new MessageQueuedResourceClass();

const message = MessageFactory(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
    name: `update: jobs - <Timestamp>`,
    topic: jobs,
    source: process.env.APP_URL,
    action: "update",
    payload: {
      name: "Job name",
      cost: 500
    },
    priority: 1
  },
  { isUpdating: false }
);

const [error, result ] = await MessageQueueResource.createOne({object: message});
console.log({error, result});
```
