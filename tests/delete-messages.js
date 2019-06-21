const messageQueued = require("../resources/message-queued/index");
const messageFailed = require("../resources/message-failed/index");
const messageInflight = require("../resources/message-inflight/index");
const messageProcessed = require("../resources/message-processed/index");

module.exports.script = () => {
	/**
	 *
	 *
	 * @returns
	 */
	function deleteManyQueued() {
		return new Promise((resolve, reject) => {
			messageQueued.deleteMany(
				{ query: { topic: "internal-test" } },
				(err, res) => {
					return resolve(res.deletedCount);
				}
			);
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function deleteManyInflight() {
		return new Promise((resolve, reject) => {
			messageInflight.deleteMany(
				{ query: { topic: "internal-test" } },
				(err, res) => {
					return resolve(res.deletedCount);
				}
			);
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function deleteManyFailed() {
		return new Promise((resolve, reject) => {
			messageFailed.deleteMany(
				{ query: { topic: "internal-test" } },
				(err, res) => {
					return resolve(res.deletedCount);
				}
			);
		});
	}

	/**
	 *
	 *
	 * @returns
	 */
	function deleteManyProcessed() {
		return new Promise((resolve, reject) => {
			messageProcessed.deleteMany(
				{ query: { topic: "internal-test" } },
				(err, res) => {
					return resolve(res.deletedCount);
				}
			);
		});
	}

	// Add all your functions to be processed sync / async
	/**
	 * Process functions
	 *
	 */
	async function asyncFunctions() {
		let result = {};
		const del1 = await deleteManyQueued();
		const del2 = await deleteManyFailed();
		const del3 = await deleteManyInflight();
		const del4 = await deleteManyProcessed();
		result = Object.assign({}, result, {
			del1,
			del2,
			del3,
			del4
		});
		return { status: "delete messages test complete", result };
	}

	// Invoke our async function to process the script
	asyncFunctions()
		.then((result) => {
			console.log(result);
			return "done";
		})
		.catch((err) => {
			console.log(err);
			return "done";
		});
};

this.script();
