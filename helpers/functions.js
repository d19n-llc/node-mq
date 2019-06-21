exports.PrependZeros = (int, length) => {
	const string = `${int > 0 ? int : -int}`;
	let zeros = "";
	for (let i = length - string.length; i > 0; i--) zeros += "0";
	zeros += string;
	return int >= 0 ? zeros : `-${zeros}`;
};
/**
 * A helper function, that loops through a given number of items that perform
 * a number of asynchronous actions
 *
 * @param {*} array
 * @param {*} response
 */
exports.seriesLoop = async (array, response) => {
	for (let index = 0; index < array.length; index += 1) {
		await response(array[index], index, array.length);
	}
};
/**
 *For processing batch queries
 *
 * @param {*} params
 * @param {*} res
 */
exports.asyncForLoop = async (params, res) => {
	const { total, incrementBy } = params;
	for (let index = 0; index < total; index += incrementBy) {
		await res(index, total);
	}
};
/**
 * For adding a pause between async/await processes
 *
 * @param {*} params
 * @param {*} res
 */
exports.pauseAsyncFunctions = async (ms) =>
	new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
