const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messagesController");

// Send a new message
router.post("/send", (req, res) => messageController.sendMessage(req, res));

// Get all messages
router.get("/messages", (req, res) =>
  messageController.getAllMessages(req, res)
);

// Get messages for specific user
router.get("/messages/:userId", (req, res) =>
  messageController.getMessagesForUser(req, res)
);

module.exports = router;
