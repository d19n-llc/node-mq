// module.exports.script = () => {
// 	let stepsCompleted = {};

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function firstFunction() {
// 		return new Promise((resolve, reject) => {
// 			// custom logic here
// 			stepsCompleted = Object.assign({}, stepsCompleted, {
// 				firstFunction: "processed the first function"
// 			});
// 			return resolve();
// 		});
// 	}

// 	/**
// 	 *
// 	 *
// 	 * @returns
// 	 */
// 	function secondFunction() {
// 		return new Promise((resolve, reject) => {
// 			// custom logic here
// 			stepsCompleted = Object.assign({}, stepsCompleted, {
// 				secondFunction: "processed the second function"
// 			});
// 			return resolve();
// 		});
// 	}

// 	// Add all your functions to be processed sync / async
// 	/**
// 	 * Process functions
// 	 *
// 	 */
// 	async function asyncFunctions() {
// 		await verifymessage();
// 		await parseMessage();
// 		await processMessage();
// 		return { stepsCompleted };
// 	}

// 	// Invoke our async function to process the script
// 	asyncFunctions()
// 		.then((result) => {
// 			console.log(result);
// 		})

// 		.catch((err) => {
// 			console.log(err);
// 		});
// };
// this.script();
