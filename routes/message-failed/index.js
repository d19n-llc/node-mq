const router = require("express").Router();
const { findMany } = require("../../controllers/message-failed/controller");

router.get("/mq-message-failed", findMany);
// router.post("/mq-message-failed/:id/retry", retryOne);

module.exports = router;
