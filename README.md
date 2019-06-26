# Nodejs Pub / Sub Message Queu For Microservices

## In Development

_This package is currently in development and will be ready
on June 28, 2019._

API Documentation can be found here:
https://documenter.getpostman.com/view/3524007/S1a4X7BT

A distributed messaging queue built for Node.js/express applications and designed
for a horizontally scalling micro service architecture. You can have
applications running in clusters and on multiple servers working to satisfy
the queued messages, scale your apps horizontally and the node-mq handles
deduplication and batch processing to prevent processing a message more than once.

When deploying a new micro service into your network, install the node-mq package,
then subscribe to other micro services using this package by sending a POST requst
to the <APP_URL>/mq-subscriber endpoint to begin a recieving messages from the
micro service you have subscribed to.

```

POST http://localhost:3000/api/mq-subscriber
// pass in the body
body: {
"subscriberUrl": "http://requestbin.fullcontact.com/13oqj921",
"topics":["job", "projects", "programs"]
}

// the response will be the _id of the subsciber and the publisher url where
// you can access messages processed. (Save this reponse in the publisher)
// collection

response: {
    "_id": "5d129253976c8f0e83950363",
    "publisherUrl": "http://127.0.0.1:8083/api/mq-message"
}

// Create a new publisher

const publisher = Publisher.constructor({
  body: { publisherUrl: response.publisherUrl, subscriberId: response._id
});

// Store the publisher

AddPublisher({body: publisher}, (err,res) => {
  console.log(err,res);
});

```

For Example messages with a topic of i.e ["job", "projects", "programs"] will be published
to the subsciberUrl if the subscriber is subscribed to one or all of those topics.

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
MQ_MESSAGES_URL=http://localhost:3000/api/mq-message-processed

```

4.) from your terminal cd into your project directory and run the following
command to create all the collections used by node-mq.

```
node -e 'require("@d19n/node-mq").CreateCollections()'
node -e 'require("@d19n/node-mq").RunTests()'
```

5.) The message queue exports routes for you to use in your app. Our routes/index.js
file is setup to merge routers into a single app router. An example is below for
how we merge routers.

Copy & Paste the following express routers to your routes index.js file.

```
const express = require("express");

const router = express.Router();

const mqQueuedRouter = require("@d19n/node-mq/routes/message-queued");
const mqInflightRouter = require("@d19n/node-mq/routes/message-inflight");
const mqFailedRouter = require("@d19n/node-mq/routes/message-failed");
const mqProcessedRouter = require("@d19n/node-mq/routes/message-processed");
const mqPublisherRouter = require("@d19n/node-mq/routes/message-publisher");
const mqSubscriberRouter = require("@d19n/node-mq/routes/message-subscriber");

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

6.) Create a file in your root directory named "mq-scripts.js" and register
all the scripts that you want to have the mq run when messages are added to the queue.
the message queue will import this file to access all scripts registered by topic.

Set the key equal to the message "topic" for your script to be processed.
The value is the module you want the queue processor to run when a message
with the topic equal to the registered script "key"

```
const jobMessageScript = require("path/to/script");
const projectMessageScript = require("path/to/script");
const programMessageScript = require("path/to/script");
const customJobScript = require("path/to/script");
const customJobTwoScript = require("path/to/script");

// [topic]: function()
module.exports = {
	jobs: jobMessageScript,
  projects: projectMessageScript,
  programs: programMessageScript,
	customJob1: customJobScript,
	customJob2: customJobTwoScript,
};


```

7.) If you want to process custom scripts. You can register a script with a "key".
equal to the topic name of the message. Then add a message to the queue when
ever you want the script processed.

When a script is processed the queue will pass a message to your script.

```
module.exports = ({ message }, callback = () => {}) => {
	console.log("In your registered module", {
    message: {
      name: "", // a unique identifier for the message
      source: "",
      topic: "", // provides context for the payload
      priority: 0, // 0,1,2 messages are prioritised descending 0-low, 1-med, 2-high
      maxRetries: 3,
      payload: {}, // The data being processed
    }
  });
  function handleMessage(){
    // Your custom code here to process a message
  }
	return callback(undefined, { message });
};

```

## Publishing a message

1.) To create a scheduled Job. Create a message with the "topic" for a script you
want to run i.e "customJob1". This message will run a script registered with the key
"customJob1".

```
const { Message, AddMessageToQueue } = require("@d19n/node-mq");

Message.constructor(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
    name: `custom-job-one`,
    topic: "customJob1",
    source: process.env.APP_NAME, // Set the source to the app name
    payload: {
      description: "Running a custom job script",
    },
    priority: 1
  },
  { isUpdating: false }
);

AddMessageToQueue({body: message});

```

2.) If you want to publish a message that is sent to all subscribers. Add a message
with the source: process.env.APP_NAME. And the topic can be anything you want. In
the case of data replication we set the topic: "Entity" i.e (programs, projects, jobs)

```
const { Message, AddMessageToQueue } = require("@d19n/node-mq");

const message = Message.constructor(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
    name: `updated: jobs - <Timestamp>`,
    topic: jobs,
    source: process.env.APP_NAME, // Set the source to the app name
    payload: {name: "Job name", cost: 500},
    priority: 1
  },
  { isUpdating: false }
);

AddMessageToQueue({ body: message }, (err, res) => {
  console.log({ err, res });
});

```
