const schedule = require("node-schedule");
const registerNodes = require("../services/nodes/register");
const deleteUnhealthyNodes = require("../services/nodes/delete-unhealthy");

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)


/**
 *  Background jobs that manage registering new nodes (docker container running out application with the package installed)
 *  And cleaning up unhealthy nodes (docker containers that are no longer running and apps that are unhealthy).
 * @constructor
 */
function Scheduler() {

	// Register all healthy nodes
	schedule.scheduleJob(
		`*/1 * * * * *`,
		async () => {
			registerNodes({});
		}
	);

		// Delete any unhealthy nodes
		schedule.scheduleJob(
				`*/1 * * * * *`,
				async () => {
						deleteUnhealthyNodes({});
				}
		);



}

Scheduler();
