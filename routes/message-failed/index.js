const router = require("express").Router();
const MessageFailedClass = require("../../controllers/message-failed/controller");

const MessageFailed = new MessageFailedClass();

router.get("/mq-message-failed", MessageFailed.findMany);
// router.post("/mq-message-failed/:id/retry", retryOne);

module.exports = router;
