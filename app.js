const express = require("express");
const parser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/cb", (req, res) => {
  console.log("REQ: ", req);
  console.log("BODY: ", req.body);
  return
});

app.post("/cb", (req, res) => {
  console.log("REQ: ", req);
  console.log("BODY: ", req.body);
  return
});
