// controllers/messagesController.js
const axios = require("axios");
require("dotenv").config();

class MessageController {
  constructor() {
    this.pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
    this.messages = new Map();
  }

  // Validate if user exists and has interacted with the bot
  async validateUser(userId) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${userId}?access_token=${this.pageAccessToken}`
      );
      return true;
    } catch (error) {
      console.error("User validation error:", error.response?.data);
      return false;
    }
  }

  // Send message to user through Facebook API
  async sendMessage(req, res) {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        success: false,
        error: "User ID and text are required.",
      });
    }

    try {
      // Validate user first
      const isValidUser = await this.validateUser(userId);
      if (!isValidUser) {
        return res.status(400).json({
          success: false,
          error: {
            message:
              "Cannot send message. The user must first interact with your bot through Messenger.",
            details: "To send messages, users need to:",
            steps: [
              "1. Visit your Facebook page",
              "2. Start a conversation with your page through Messenger",
              "3. Send at least one message to your page",
            ],
          },
        });
      }

      // Send to Facebook Messenger using Facebook Graph API
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${this.pageAccessToken}`,
        {
          recipient: { id: userId },
          message: { text: text },
          messaging_type: "RESPONSE", // Specify messaging type for better delivery
        }
      );

      // Store message
      const newMessage = {
        id: Date.now().toString(),
        user: userId,
        text,
        timestamp: new Date(),
        delivered: true,
      };

      if (!this.messages.has(userId)) {
        this.messages.set(userId, []);
      }
      this.messages.get(userId).push(newMessage);

      return res.status(200).json({
        success: true,
        message: "Message sent successfully!",
        data: newMessage,
        messengerResponse: response.data,
      });
    } catch (error) {
      const errorResponse = error.response?.data?.error || error;
      console.error("Messenger Error:", errorResponse);

      // Handle specific Facebook API errors
      if (errorResponse.code === 100) {
        return res.status(400).json({
          success: false,
          error: {
            message: "User not found or cannot receive messages",
            details: "This might be because:",
            reasons: [
              "- The user hasn't messaged your page first",
              "- The user has blocked your page",
              "- The messaging window has expired (24 hours)",
              "- The user ID is incorrect",
            ],
            originalError: errorResponse,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          message: "Failed to send message",
          details: errorResponse.message || "Unknown error occurred",
          originalError: errorResponse,
        },
      });
    }
  }

  // Get all messages (from local storage)
  getAllMessages(req, res) {
    try {
      const allMessages = Array.from(this.messages.values()).flat();
      return res.status(200).json({
        success: true,
        data: allMessages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get messages",
      });
    }
  }

  // Get messages for specific user (from local storage)
  getMessagesForUser(req, res) {
    try {
      const { userId } = req.params;
      const userMessages = this.messages.get(userId) || [];
      return res.status(200).json({
        success: true,
        data: userMessages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get user messages",
      });
    }
  }

  // Store incoming message from webhook
  storeIncomingMessage(userId, messageText, messageId) {
    const newMessage = {
      id: messageId || Date.now().toString(),
      user: userId,
      text: messageText,
      timestamp: new Date(),
      incoming: true,
    };

    if (!this.messages.has(userId)) {
      this.messages.set(userId, []);
    }
    this.messages.get(userId).push(newMessage);
    return newMessage;
  }
}

module.exports = new MessageController();
