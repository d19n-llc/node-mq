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
	console.log("node queue cron scheduler running");
	schedule.scheduleJob("5 * * * * *", () => {
		const [error, result] = deduplicateQueue();
	});
	schedule.scheduleJob("10 * * * * *", async () => {
		await offsetJobStart();
		const [error, result] = retryFailedMessages();
	});
	schedule.scheduleJob("10 * * * * *", async () => {
		await offsetJobStart();
		const [error, result] = processQueuedMessages();
	});
}

Scheduler();
