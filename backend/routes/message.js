const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const messageCtrl = require("../controllers/message");

router.post("/", auth, messageCtrl.sendMessage);
router.get("/:id", auth, messageCtrl.getConversation);

module.exports = router;