const router = require("express").Router();
const MessageQueuedClass = require("../../controllers/message-queued/controller");

const MessageQueued = new MessageQueuedClass();

router.get("/mq-message-queued", MessageQueued.findMany);
router.post("/mq-message-queued", MessageQueued.createOne);

module.exports = router;
