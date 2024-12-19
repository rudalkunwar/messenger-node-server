// app.js
const express = require("express");
const serverless = require("serverless-http");
require("dotenv").config();

const webhookRoutes = require("../../routes/webhookRoutes");
const messageRoutes = require("../../routes/messagesRoute");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("App is running hehehehheheheh");
});

app.use("/api/webhook", webhookRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Export the serverless function
exports.handler = serverless(app);
