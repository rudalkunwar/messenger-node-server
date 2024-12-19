// netlify-functions/server.js
// const { handler } = require('@netlify/functions');
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from Netlify Server!");
});

// // Wrap the Express app into the Netlify handler
// exports.handler = handler(app);

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
