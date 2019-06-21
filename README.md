# Microserive Messaging

!!! In Development !!!

A distributed messaging queue built for Node.js/express applications designed for
a micro service first architecture. You can have mutliple applications working
to satisfy the demands of the job queue, scale your apps horizontally and the
node-mq handles deduplication and batch processing to avoid cases where a message
is processed by two applications.

very micro service you deploy into your network can use the node-mq package,
subscribe to other micro services to recieve messages and process messages.

In addition the message queue will allow for each micro service to process events
from third party webhooks and inject custom scripts you want to run on those events.
The message queue will process the message, handle failures, retries and roll backs.

## Getting Started

1.) yarn add @d19n/node-mq or npm install @d19n/node-mq

2.) import the package in your server.js file

```
require("@d19n/node-mq);

```

3.) add the mongodb url and database name in your .env file

```
MQ_MONGODB_URL=
MQ_MONGODB_NAME=
MQ_MESSAGES_URL=

```

4.) from your terminal cd into your project directory and run the following command to create
all the collections used by node-mq.

```
node -e 'require("@d19n/node-mq").CreateCollections()'
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
all the scripts that you want to have the mq run on messages recieved in the queue.
the message queue will import this file to access all scripts registered.

the key is the message "topic"
the value is the module.export = ({message}) =>

```
const testModule = require("./api/scripts/mq-test");
// const module2 = require("path/to/script2");

module.exports = {
	test: testModule,
	// topic2: module2,
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
  retryOnFail: false,
  totalRetries: 3,
  retriedCount: 0,
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
