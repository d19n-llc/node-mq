// eslint-disable-next-line global-require

require("dotenv").config({
	path: `${process.cwd()}/.env`
});

// const handleOrderMessages = require("path/to/module");
// const handleProjectMessages = require("path/to/module");
// const handleInvoiceMessages = require("path/to/module");

// [topic]: function()
module.exports.messageHandlers = {
	// orders: handleOrderMessages,
	// projects: handleProjectMessages,
	// invoices: handleInvoiceMessages,
};

module.exports.httpHeaders = {
	Authorisation: process.env.AUTH_TOKEN,
	"X-Custom-Header": "<CUSTOM_HEADER_VALUE>"
};

module.exports.queueSettings = {
	// Support applications running in clusters
	// For PM2 this variable is declared in the ecosystem.config.js
	appInstanceId: process.env.INSTANCE_ID
};
