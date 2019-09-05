/** Make error. Makes error from message or throws passed-in err  */

function makeError(message, statusCode) {
	const err = message instanceof Error ? message : new Error(message);
	err.statusCode = statusCode || 500;

	return err;
}

/** handler for 404 routes. */

function error404(error, req, res, next) {
	const err = makeError("Not Found", 404);
	// pass the error to the next piece of middleware
	return next(err);
}

/** general error handler */

function handleRouteErrors(error, req, res, next) {
	// for actual JS exceptions, log the exception stack
	if (error.stack) console.error("error.stack", error.stack);
	res.status(error.statusCode || 500).send({ message: error.message });
}

function clientErrorHandler(message, response) {
	// for actual JS exceptions, log the exception stack
	const error = message instanceof Error ? message : new Error(message);
	error.statusCode = error.statusCode || 500;
	if (error.stack) console.error("error.stack", error.stack);
	return response
		.status(error.statusCode || 500)
		.send({ message: error.message });
}

module.exports = {
	makeError,
	error404,
	handleRouteErrors,
	clientErrorHandler
};
