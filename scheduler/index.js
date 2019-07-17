const schedule = require("node-schedule");
const deduplicateQueue = require("../services/deduplicate");
const processQueuedMessages = require("../services/queue");
const retryFailedMessages = require("../services/retry-failed");
const { offsetJobStart } = require("../helpers/processing");

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

function Scheduler() {
	schedule.scheduleJob("1 * * * * *", () => {
		console.log("mq deduplicating messages...");
		deduplicateQueue({});
	});
	schedule.scheduleJob("5 * * * * *", async () => {
		await offsetJobStart();
		console.log("mq processing messages...");
		processQueuedMessages({});
	});
	schedule.scheduleJob("30 * * * * *", async () => {
		await offsetJobStart();
		console.log("mq retrying failed messages...");
		retryFailedMessages({});
	});
}

Scheduler();
