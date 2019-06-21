const router = require("express").Router();
const {
	createOne,
	findMany
} = require("../../controllers/message-queued/controller");

router.get("/mq-message-queued", findMany);
router.post("/mq-message-queued", createOne);

module.exports = router;
