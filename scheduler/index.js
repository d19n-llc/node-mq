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
	console.log("node queue cron scheduler running");
	schedule.scheduleJob("1 * * * * *", () => {
		deduplicateQueue({});
	});
	schedule.scheduleJob("2 * * * * *", async () => {
		await offsetJobStart();
		console.log("retrying failed messages...");
		retryFailedMessages({});
	});
	schedule.scheduleJob("2 * * * * *", async () => {
		await offsetJobStart();
		console.log("processing queued messages...");
		const [error, result] = await processQueuedMessages({});
		console.log({ error, result });
	});
}

Scheduler();
