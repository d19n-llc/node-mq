const router = require("express").Router();
const PublisherClass = require("../../controllers/publisher/controller");

const Publisher = new PublisherClass();

router.get("/mq-publisher", Publisher.findMany);
router.get("/mq-publisher/:id", Publisher.findOne);
router.post("/mq-publisher", Publisher.createOne);
router.delete("/mq-publisher/:id", Publisher.deleteOne);

// Create a relationship with a publisher from the subscribing service
router.post("/mq-publisher/subscriber", Publisher.createSubscriber);

module.exports = router;
