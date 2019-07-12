const router = require("express").Router();
const MessageInflightClass = require("../../controllers/message-inflight/controller");

const MessageInflight = new MessageInflightClass();

router.get("/mq-message-inflight", MessageInflight.findMany);
router.post("/mq-message-inflight/retry", MessageInflight.batchRetry);

module.exports = router;
