const axios = require("axios");

let httpHeaders = {};

try {
	const config = require(`${process.cwd()}/mq-config`);
	httpHeaders = config.httpHeaders;
} catch (err) {
	// set to default
	httpHeaders = {};
	console.error(err);
}

exports.GET = async (params) => {
	const { url } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;
	try {
		const response = await axios({
			method: "get",
			url: baseRoute,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"request-source": "node-mq",
				...httpHeaders
			}
		});
		return [undefined, response];
	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx

			return [error.response.data.message, undefined];
		}
		if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js

			return [
				new Error("The request was made but no response was received"),
				undefined
			];
		}
		// Something happened in setting up the request that triggered an Error

		return [error.message, undefined];
	}
};

exports.POST = async (params) => {
	const { url, payload } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;

	try {
		const response = await axios({
			method: "post",
			url: baseRoute,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"request-source": "node-mq",
				...httpHeaders
			},
			data: payload
		});

		return [undefined, response];
	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx

			return [error.response.data.message, undefined];
		}
		if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js

			return [
				new Error("The request was made but no response was received"),
				undefined
			];
		}
		// Something happened in setting up the request that triggered an Error

		return [error.message, undefined];
	}
};

exports.PUT = async (params) => {
	const { url, payload } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;
	try {
		const response = await axios({
			method: "put",
			url: baseRoute,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"request-source": "node-mq",
				...httpHeaders
			},
			data: payload
		});
		return [undefined, response];
	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx

			return [error.response.data.message, undefined];
		}
		if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js

			return [
				new Error("The request was made but no response was received"),
				undefined
			];
		}
		// Something happened in setting up the request that triggered an Error

		return [error.message, undefined];
	}
};
