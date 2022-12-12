const express = require("express");
const parser = require("body-parser");
const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cb", (req, res) => {
  // console.log("REQ: ", req);
  let mode = req.query["hub.mode"];
  console.log("Mode: ", mode);
  let token = req.query["hub.verify_token"];
  console.log("Token: ", token);
  let challenge = req.query["hub.challenge"];
  console.log("Challenge: ", challenge);
  if (mode && token) {
    console.log("mode: ", mode)
    if (mode === "subscribe" && token === "test") {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
  console.log("end")
});

app.post("/cb", (req, res) => {
  console.log("REQ: ", req);
  console.log("BODY: ", req.body);
  res.send("CB POST");
});

module.exports = app;
