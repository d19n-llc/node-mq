// Starts the node scheduler
require("./scheduler");

const NodeResourceClass = require("./resources/node");
const isMasterNode = require("./services/nodes/check-if-master");

module.exports = {

	NodeResourceClass,
	isMasterNode,

};
