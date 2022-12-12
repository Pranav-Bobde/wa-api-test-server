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
  console.log("REQ: ", req);
  const body = req.body;
  const entries = body.entry;
  const id = entries[0].id;
  const changes = entries[0].changes;
  const number = changes[0].value.contact[0].wa_id;
  res.send("CB POST");
});

module.exports = app;
