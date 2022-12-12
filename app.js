const express = require("express");
const parser = require("body-parser");
const app = express();

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
        res.sendStatus(200);
    }
  }
});

module.exports = app;
