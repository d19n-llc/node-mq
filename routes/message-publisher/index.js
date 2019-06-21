const router = require("express").Router();
const {
	createOne,
	findMany,
	deleteOne
} = require("../../controllers/message-publisher/controller");

router.get("/mq-publisher", findMany);
router.post("/mq-publisher", createOne);
router.delete("/mq-publisher/:id", deleteOne);

module.exports = router;
