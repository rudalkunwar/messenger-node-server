const axios = require("axios");

// Replace with your Page Access Token
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Preferably use environment variables for security

// Controller to handle sending a message
const sendMessage = async (req, res) => {
  const { user, text } = req.body;

  if (!user || !text) {
    return res.status(400).json({ error: "User and text are required." });
  }

  const newMessage = { user, text, timestamp: new Date() };

  try {
    // Make a POST request to Facebook's Graph API to send the message
    const response = await axios.post(
      `https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        messaging_type: "RESPONSE",
        recipient: { id: user },
        message: { text: text },
      }
    );

    console.log("Message sent successfully:", response.data);
    res.status(200).json({
      message: "Message sent successfully!",
      newMessage,
    });
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to send message." });
  }
};

// Controller to get all messages
const getMessages = (req, res) => {
  res.status(200).json(messages);
};

// Controller to get messages for a specific user
const getMessagesForUser = (req, res) => {
  const { user } = req.params;
  const userMessages = messages.filter((msg) => msg.user === user);
  res.status(200).json(userMessages);
};

// Simulating a simple storage for received messages (replace with DB in production)
let messages = [];

module.exports = { sendMessage, getMessages, getMessagesForUser };
