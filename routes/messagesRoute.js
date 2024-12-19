const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getMessagesForUser,
} = require("../controllers/messagesController");

router.post("/send", sendMessage);
router.get("/messages", getMessages);
router.get("/messages/:user", getMessagesForUser);

module.exports = router;
