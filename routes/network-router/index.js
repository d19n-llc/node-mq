const router = require("express").Router();
const NetworkRouterClass = require("../../controllers/network-router/controller");

const NetworkRouter = new NetworkRouterClass();
// Create a relationship with a NetworkRouter from the subscribing service
router.post("/network-router", NetworkRouter.createOne);

module.exports = router;
