const axios = require("axios");

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
			"X-source": "node-mq",
			Authorization: "internal-auth-token-here",
		},
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
	console.log({ baseRoute });
	axios({
		method: "post",
		url: baseRoute,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-source": "node-mq",
			Authorization: "internal-auth-token-here",
		},
		data: payload,
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
			"X-source": "node-mq",
			Authorization: "internal-auth-token-here",
		},
		data: payload,
	})
		.then((res) => {
			callback(undefined, res.data);
		})
		.catch((err) => {
			callback(err, undefined);
		});
};
