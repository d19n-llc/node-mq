const router = require("express").Router();
const { findMany } = require("../../controllers/message-processed/controller");

router.get("/mq-message-processed", findMany);

module.exports = router;
