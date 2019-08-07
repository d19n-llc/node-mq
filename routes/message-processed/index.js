const router = require("express").Router();
const MessageProcessedClass = require("../../controllers/message-processed/controller");

const MessageProcessed = new MessageProcessedClass();

router.get("/mq-message-processed", MessageProcessed.findMany);
router.get("/mq-message-processed/:id", MessageProcessed.findOne);

module.exports = router;
