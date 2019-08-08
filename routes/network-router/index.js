const router = require("express").Router();
const NetworkRouterClass = require("../../controllers/network-router/controller");

const NetworkRouter = new NetworkRouterClass();
// Create a relationship with a NetworkRouter from the subscribing service
router.get("/mq-network-router", NetworkRouter.findMany);
router.get("/mq-network-router/:id", NetworkRouter.findOne);
router.post("/mq-network-router", NetworkRouter.createOne);

module.exports = router;
