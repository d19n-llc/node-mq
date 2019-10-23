# Nodejs Pub / Sub Message Queue For Microservices

API Documentation can be found here:
https://documenter.getpostman.com/view/3524007/S1a4X7BT

A distributed messaging queue built for Node.js/express applications and designed
for a horizontally scaling microservice architecture. You can have
applications running in clusters and on multiple servers working to satisfy
the queued messages, scale your apps horizontally, and the node-mq handles
deduplication and batching to prevent processing a message more than once.

When deploying a new application into your network, install the node-mq package,
then subscribe to other microservices using this package.

Road Map:

1. Lightweight interface to monitor/manage the queue.
2. Sync with publishers after a service outage, which will batch fetch
   all messages after the last received message from all publishers.

## Getting Started

1.) yarn add @d19n/node-mq or npm install @d19n/node-mq

2.) import the package in your server.js file

```
require("@d19n/node-mq);

```

3.) add the mongodb url and database name in your .env file

```
MONGODB_URL=mongodb+srv://<user></user>:<password></password>@test-nbfdp.mongodb.net/test?retryWrites=true&w=majority
MONGODB_NAME=<db_name>

```

4.) The message queue exports routes for you to use in your app. Our routes/index.js
file is set up to merge routers into a single app router. An example is below for
how we merge routers.

Copy & Paste the following express routers to your routes **index.js** file. You
can see an example of how we export a route file.
https://github.com/d19n-llc/d19n-node-mq/blob/01ee47c4437bcf58654e6a52d61b5046e81b51ef/routes/publisher/index.js

```
const express = require("express");

const router = express.Router();

const mqQueuedRouter = require("@d19n/node-mq/routes/message-queued");
const mqInflightRouter = require("@d19n/node-mq/routes/message-inflight");
const mqFailedRouter = require("@d19n/node-mq/routes/message-failed");
const mqProcessedRouter = require("@d19n/node-mq/routes/message-processed");
const mqPublisherRouter = require("@d19n/node-mq/routes/publisher");
const mqSubscriberRouter = require("@d19n/node-mq/routes/subscriber");
const mqNetworkRouter = require("@d19n/node-mq/routes/network-router");

const combineRouters = [
  mqQueuedRouter,
  mqInflightRouter,
  mqFailedRouter,
  mqProcessedRouter,
  mqPublisherRouter,
  mqSubscriberRouter,
  mqNetworkRouter,
  ...other routers
].reduce((newArray, elem) => [...newArray, ...elem.stack], []);

router.stack = combineRouters;
module.exports = router;
```

6.) Create a file in your root directory named **"mq-config.js"** and register
all the scripts that you want to have the mq run when messages are added to the queue.
The message queue will import this file to access all scripts registered by the topic.

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
	"Access-Token": process.env.API_ACCESS_TOKEN,
	"X-Custom-Header": "<CUSTOM_HEADER_VALUE>"
}

module.exports.queueSettings = {
	// Support applications running in clusters
	// For PM2 this variable is declared in the ecosystem.config.js
	appInstanceId: process.env.INSTANCE_ID,
  batchCount: 250 // default
};
```

Example of the http headers in the message queue. Make sure your nginx config
allows [ request-source, Content-type, Accept ] headers or requests might fail.

```
headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "request-source": "node-mq",
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
Equal to the topic name of the message. Then add a message to the queue whenever
you want the script processed.

When a script is processed, the queue will pass a message to your script.

```
module.exports = ({ message }) => {
	console.log("In your registered module", { message });
  function handleMessage(){
    // Your custom code here to process a message
  }
	return [undefined, { message }];
};

```

#### Error Handling

9.) An example of your error handler in your Express App **server.js** file
the global error handler is below. We send a message response back in json
format with an http status code. Then in our http/requests.js file in the node-mq.
We process the errors as a json object, which gives us more flexibility in the errors
we can send when our application has errors.

```
... All other code

// Global error handler
app.use((err, req, res, next) => {
	if (!err.status) err.status = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
	res.status(err.status).send({ error: { message: err.message } }); // All HTTP requests must have a response, so let's send back an error with its status code and message
});
... All other code
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
    userId: "5cf1a9f8b79aa40017af4c35",
    name: `CustomJobOne-<Timestamp>`,
    topic: "customJob1",
    source: "internalProcess",
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
the case of data replication, we set the topic: "Entity" i.e. (programs, projects, jobs)

```
const { MessageFactory, MessageQueuedResourceClass } = require("@d19n/node-mq");

const MessageQueueResource = new MessageQueuedResourceClass();

const message = MessageFactory(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
        userId: "5cf1a9f8b79aa40017af4c35",
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
