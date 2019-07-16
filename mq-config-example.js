// eslint-disable-next-line global-require

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
