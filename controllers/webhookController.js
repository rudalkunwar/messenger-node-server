require("dotenv").config();
const fetch = require("node-fetch");

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Webhook Controller
const webhookController = {
  // Webhook Verification
  verifyWebhook: (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      // Check if the mode is 'subscribe' and token matches
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge); // Respond with challenge to verify
      } else {
        res.sendStatus(403); // Forbidden if token is incorrect
      }
    } else {
      res.sendStatus(400); // Bad Request if mode or token is missing
    }
  },

  // Handle Incoming Webhook Events
  handleWebhook: (req, res) => {
    const body = req.body;

    if (body.object === "page") {
      // Iterate through entries from Facebook webhook
      body.entry.forEach(function (entry) {
        const webhook_event = entry.messaging[0];
        console.log("Webhook Event: ", webhook_event);

        const sender_psid = webhook_event.sender.id; // Sender's PSID
        console.log("Sender PSID: " + sender_psid);

        // If the webhook contains a message
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        }
        // If the webhook contains a postback (button click)
        else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });

      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404); // Not Found if the body does not contain a page object
    }
  },
};

// Handle Text and Image Messages
const handleMessage = async (sender_psid, received_message) => {
  let response;

  // Check if the received message is text
  if (received_message.text) {
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`,
    };
  }
  // If the received message contains an attachment (e.g., an image)
  else if (received_message.attachments) {
    const attachment_url = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes",
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no",
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response back to the user
  await callSendAPI(sender_psid, response);
};

// Handle Postback (Button Click) Responses
const handlePostback = async (sender_psid, received_postback) => {
  let response;
  const payload = received_postback.payload;

  // If the postback payload is 'yes'
  if (payload === "yes") {
    response = { text: "Thanks!" };
  }
  // If the postback payload is 'no'
  else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }

  // Send the response back to the user
  await callSendAPI(sender_psid, response);
};

// Function to Send API Request to Facebook Graph API
const callSendAPI = async (sender_psid, response) => {
  const request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  try {
    const result = await fetch(
      `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request_body),
      }
    );

    const resultJson = await result.json();
    console.log("Message sent successfully: ", resultJson);
    return resultJson;
  } catch (error) {
    console.error("Unable to send message: ", error);
    throw error;
  }
};

// Export the webhook controller
module.exports = webhookController;
