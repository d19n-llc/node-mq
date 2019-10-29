const schedule = require("node-schedule");
const electNodes = require("../services/elect-nodes");
const assignNodes = require("../services/assign-nodes");
const deduplicateQueue = require("../services/deduplicate");
const processQueuedMessages = require("../services/queue");
const retryFailedMessages = require("../services/retry-failed");
const clearMessageLocks = require("../services/workers/clear-message-locks");
const deleteUnhealthyNodes = require("../services/workers/delete-unhealth-nodes");
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
	console.log({ queueSettings });
	// Eelect master and slave nodes
	schedule.scheduleJob(
		`*/${queueSettings.electNodes || 1} * * * * *`,
		async () => {
			// await offsetJobStart({ appInstance: queueSettings.appInstanceId });
			console.log("delete unhealthy nodes");
			deleteUnhealthyNodes({});
		}
	);
	schedule.scheduleJob(
		`*/${queueSettings.electNodes || 1} * * * * *`,
		async () => {
			console.log("elect nodes");
			electNodes({});
		}
	);

	schedule.scheduleJob(
		`*/${queueSettings.electNodes || 1} * * * * *`,
		async () => {
			console.log("clear message locks");
			clearMessageLocks({});
		}
	);

	schedule.scheduleJob(
		`*/${queueSettings.electNodes || 1} * * * * *`,
		async () => {
			console.log("assign nodes");
			assignNodes({});
		}
	);

	// Process messages queued
	schedule.scheduleJob(
		`*/${queueSettings.processQueueEvery || 1} * * * * *`,
		async () => {
			console.log("process queue");
			processQueuedMessages({});
			console.log("complete");
		}
	);
	// Retry failed messages
	schedule.scheduleJob(
		`*/${queueSettings.retryFailedEvery || 5} * * * * *`,
		async () => {
			console.log("retry failed");
			retryFailedMessages({});
		}
	);
}

Scheduler();
