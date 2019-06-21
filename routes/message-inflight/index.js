const router = require("express").Router();
const { findMany } = require("../../controllers/message-inflight/controller");

router.get("/mq-message-inflight", findMany);

module.exports = router;
