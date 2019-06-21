const schedule = require("node-schedule");
const deduplicateQueue = require("../services/deduplicate");
const processQueuedMessages = require("../services/process/queue");
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
	console.log("cron scheduler running");

	schedule.scheduleJob("5 * * * * *", () => {
		deduplicateQueue({}, (err, res) => {});
	});
	schedule.scheduleJob("15 * * * * *", async () => {
		await offsetJobStart();
		retryFailedMessages({}, (err, res) => {});
	});

	schedule.scheduleJob("15 * * * * *", async () => {
		await offsetJobStart();
		processQueuedMessages({}, (err, res) => {});
	});
}

Scheduler();
