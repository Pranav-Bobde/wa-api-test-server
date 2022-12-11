const express = require("express");
const parser = require("body-parser");
const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cb", (req, res) => {
  console.log("REQ: ", req);
  console.log("BODY: ", req.body);
  res.send("CB GET");
});

app.post("/cb", (req, res) => {
  console.log("REQ: ", req);
  console.log("BODY: ", req.body);
  res.send("CB POST");
});

module.exports = app;
