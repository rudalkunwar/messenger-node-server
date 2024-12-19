// netlify-functions/server.js
const { handler } = require('@netlify/functions');
const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.send('Hello from Netlify Server!');
});

// Wrap the Express app into the Netlify handler
exports.handler = handler(app);
