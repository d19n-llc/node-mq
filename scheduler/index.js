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
	let queueSettings = {};
	try {
		// eslint-disable-next-line global-require
		const config = require(`${process.cwd()}/mq-config`);
		queueSettings = config.queueSettings;
	} catch (err) {
		// set to default
		queueSettings = {};
	}
	schedule.scheduleJob("1 * * * * *", () => {
		deduplicateQueue({});
	});
	schedule.scheduleJob("4 * * * * *", async () => {
		await offsetJobStart({ addTime: queueSettings.appInstanceId });
		processQueuedMessages({});
	});
	schedule.scheduleJob("8 * * * * *", async () => {
		await offsetJobStart({ addTime: queueSettings.appInstanceId });
		retryFailedMessages({});
	});
}

Scheduler();
