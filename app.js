const express = require("express");
const parser = require("body-parser");
const app = express();
const https = require("https");
const Pool = require("pg").Pool;
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
});

async function replyMessage(number, token) {
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v15.0/108004132170880/messages",
      {
        messaging_product: "whatsapp",
        to: `${number}`,
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
                  text: `https://wa-api-test-server.onrender.com/whatsapp?data=${token}`,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}


app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));

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

app.post("/cb", async (req, res) => {
  const body_param = req.body;

  console.log("BODY: ", body_param);
  console.log("CHANGES: ", body_param.entry[0].changes[0]);
  console.log(
    "Statuses: ",
    JSON.stringify(body_param.entry[0].changes[0].value.statuses)
  );

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0]["value"].messages
    ) {
      try {
        console.log(
          "Number: ",
          body_param.entry[0].changes[0]["value"].messages[0].from
        );

        const name =
          body_param.entry[0].changes[0]["value"].contacts[0].profile.name;
        const phone = body_param.entry[0].changes[0]["value"].messages[0].from;

        console.log("Name: ", name);
        console.log("Phone: ", phone);

        console.log(
          "Message: ",
          body_param.entry[0].changes[0]["value"].messages[0].text.body
        );

        // insert if doesn't exists & get the user from the database
        const user = (
          await pool.query(
            `
            INSERT INTO "customer"."users" ("name", "phone")
            VALUES ($1, $2)
            ON CONFLICT ("phone") DO UPDATE SET "name" = excluded."name"
            RETURNING *
            `,
            [name, phone]
          )
        ).rows[0];
        console.log("USER: ", user);

        // generate a token
        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
          expiresIn: "1m",
        });

        // send a message to the user with token
        await replyMessage(
          body_param.entry[0].changes[0]["value"].messages ? body_param.entry[0].changes[0]["value"].messages[0].from : body_param.entry[0].changes[0].value.statuses[0].recipient_id,
          token
        );
      } catch (error) {
        console.log("ERROR: ", error);
      } 
      res.sendStatus(200);
    }
  }
});

app.get("/whatsapp", (req, res) => {
  const { data } = req.query;
  console.log(data);

  // verify the token
  jwt.verify(data, process.env.SECRET, (err, decoded) => {
    if (err) {
      // verify the user (status -> verified) or if token invalid delete the user
      console.log("ERROR: ", err);
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate." });
    }
  });

  res.redirect("https://wa-api-test.netlify.app/#/");
});

module.exports = app;
