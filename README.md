# Nodejs Pub / Sub Message Queu For Microservices

## In Development

```
This package is currently in development and will be ready
on June 28, 2019.

```

A distributed messaging queue built for Node.js/express applications and designed
for a horizontally scalling micro service architecture. You can have mutliple
applications working to satisfy the queued messages, scale your apps horizontally
and the node-mq handles deduplication and batch processing to prevent processing
a message more than once.

Each new micro service you deploy into your network, install the node-mq package,
then subscribe to other micro services by sending a POST requst to the /mq-subscriber
endpoint and begin a pub /sub relationship to messages sent between microservices.

```

POST http://localhost:3000/api/mq-subscriber

{
"subscriberUrl": "http://requestbin.fullcontact.com/13oqj921",
"topics":["job", "projects", "programs"]
}

```

Any messages with a topiuc of ["job", "projects", "programs"] will be published
to the subsciberUrl. If using the @d19n/node-mq package and the subscriber url
is "http://localhost:3000/api/mq-message-queued" then the messages will be
added to the queue and processed using your scripts to handle messages with a topic
of ["job", "projects", "programs"].

In addition, the message queue will allow for each micro service to process messages
from third party webhooks and inject custom scripts you want to run on those messages
name each sctipt by topic. The message queue will process the message, handle failures,
retries and rollbacks.

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

5.) import messaging routes into the routes/index.js file for the application

Add the following express routers to your routes directory for this example.
/routes/index.js

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

6.) Create a mq-scripts.js file in your project root directory and register
all the scripts that you want to have the mq run on messages received in the queue.
the message queue will import this file to access all scripts registered.

the key is the message "topic"
the value is the module.export = ({message}) =>

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

7.) To add a script that will run when the job queue processes messages,
all scripts you create follow the following structure.

The message passed in to your script will look like this.

```
message: {
  name: "", // a unique identifier for the message
  source: "",
  topic: "", // provides context for the payload
  priority: 0, // 0,1,2 messages are prioritised descending 0-low, 1-med, 2-high
  maxRetries: 3,
  payload: {}, // The data being processed
}

```

```
module.exports = ({ message }, callback = () => {}) => {
	console.log("In registered module");
  // Your custom code here to process a message
	return callback(undefined, { message });
};

```

## Processing scripts with the message Queue

1.) Create a message with a "topic" for a script you want to run i.e "customJob1".
Then publish the message to the queue when you want the script processed.

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

2.) Adding a message that should be published to all subscribers.

```
const { Message, AddMessageToQueue } = require("@d19n/node-mq");

const message = Message.constructor(
  {
    userAccountId: "5cf1a9f8b79aa40017af4c46",
    name: `updated: <some value> - <Timestamp>`,
    topic: <some value>,
    source: process.env.APP_NAME, // Set the source to the app name
    payload: {name: "John Smith", age: 35},
    priority: 1
  },
  { isUpdating: false }
);

AddMessageToQueue({ body: message }, (err, res) => {
  console.log({ err, res });
});

```
