const router = require("express").Router();
const { findMany } = require("../../controllers/message-failed/controller");

router.get("/mq-message-failed", findMany);

module.exports = router;
