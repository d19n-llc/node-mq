const router = require("express").Router();
const {
	createOne,
	findMany,
	deleteOne
} = require("../../controllers/message-subscriber/controller");

// const { subscribe } = require("../../services/subscribe/subscribe");

router.get("/mq-subscriber", findMany);
router.post("/mq-subscriber", createOne);
router.delete("/mq-subscriber/:id", deleteOne);

module.exports = router;
