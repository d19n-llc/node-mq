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
		let errorMessage = error.message;
		if (error.response) {
			errorMessage = error.response.data.error;
		}
		return [errorMessage, undefined];
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
		let errorMessage = error.message;
		if (error.response) {
			errorMessage = error.response.data.error;
		}
		return [errorMessage, undefined];
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
		let errorMessage = error.message;
		if (error.response) {
			errorMessage = error.response.data.error;
		}
		return [errorMessage, undefined];
	}
};
