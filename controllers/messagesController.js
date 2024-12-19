// messagesController.js

// Simulating a simple storage for received messages
let messages = [];

// Controller to handle sending a message
const sendMessage = (req, res) => {
  const { user, text } = req.body;

  if (!user || !text) {
    return res.status(400).json({ error: 'User and text are required.' });
  }

  const newMessage = { user, text, timestamp: new Date() };
  messages.push(newMessage);

  res.status(200).json({
    message: 'Message sent successfully!',
    newMessage,
  });
};

// Controller to handle receiving all messages
const getMessages = (req, res) => {
  res.status(200).json({
    messages,
  });
};

// Controller to handle getting messages for a specific user
const getMessagesForUser = (req, res) => {
  const { user } = req.params;

  const userMessages = messages.filter(message => message.user === user);

  res.status(200).json({
    messages: userMessages,
  });
};

module.exports = { sendMessage, getMessages, getMessagesForUser };
