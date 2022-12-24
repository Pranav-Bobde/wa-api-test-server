const express = require("express");
const parser = require("body-parser");
const app = express();
const https = require("https");

function replyMessage() {
  const options = {
    hostname: "graph.facebook.com",
    path: "/v15.0/101383002832623/messages",
    method: "POST",
    headers: {
      Authorization:
        `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(
    JSON.stringify({
      messaging_product: "whatsapp",
      to: "919370892274",
      type: "template",
      template: {
        name: "sample_shipping_confirmation",
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: "https://wa-api-test-server.onrender.com/whatsapp?data=access_token",
              },
            ],
          },
        ],
      },
    })
  );

  req.end();
}

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cb", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === "test") {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/cb", (req, res) => {
  const body_param = req.body;
  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0]["value"].messages
    ) {
      console.log(
        "Number: ",
        body_param.entry[0].changes[0]["value"].messages[0].from
      );
      console.log(
        "Message: ",
        body_param.entry[0].changes[0]["value"].messages[0].text.body
      );

      replyMessage();

      res.sendStatus(200);
    }
  }
});

app.get("/whatsapp", (req, res) => {
  const { data } = req.query;
  console.log(data);
  res.redirect("https://wa-api-test.netlify.app/#/");
});
module.exports = app;
