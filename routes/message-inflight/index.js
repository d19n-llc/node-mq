const router = require("express").Router();
const {
	findMany,
	batchRetry
} = require("../../controllers/message-inflight/controller");

router.get("/mq-message-inflight", findMany);
router.post("/mq-message-inflight/retry", batchRetry);

module.exports = router;
