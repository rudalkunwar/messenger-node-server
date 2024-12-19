const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

router.post("/send", messagesController.sendMessage); // Route for sending messages
router.get("/receive", messagesController.receiveMessage); // Route for receiving messages (e.g., fetching messages)

module.exports = router;