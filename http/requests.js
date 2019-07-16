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

exports.GET = (params, callback) => {
	const { url } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;
	axios({
		method: "get",
		url: baseRoute,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"x-source": "node-mq",
			...httpHeaders
		}
	})
		.then((res) => {
			callback(undefined, res.data);
		})
		.catch((err) => {
			callback(err, undefined);
		});
};

exports.POST = (params, callback) => {
	const { url, payload } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;
	axios({
		method: "post",
		url: baseRoute,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"x-source": "node-mq",
			...httpHeaders
		},
		data: payload
	})
		.then((res) => {
			callback(undefined, res.data);
		})
		.catch((err) => {
			callback(err, undefined);
		});
};

exports.PUT = (params, callback) => {
	const { url, payload } = params;
	// entity ex: tickets, macros etc..
	const baseRoute = `${url}`;
	axios({
		method: "put",
		url: baseRoute,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"request-source": "node-mq",
			...httpHeaders
		},
		data: payload
	})
		.then((res) => {
			callback(undefined, res.data);
		})
		.catch((err) => {
			callback(err, undefined);
		});
};
