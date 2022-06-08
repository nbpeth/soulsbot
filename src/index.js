const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const { getInteraction, startApp } = require("./interaction");

app.use(express.json());
app.use(express.urlencoded());

app.get("/api/v1/health", (req, res) => {
  res.status(200);
  res.send({ feelin: "fine" });
});

const authHandler = async (res, body, headers) => {
  return new Promise((resolve, reject) => {
    const requestequestToken = body["token"];
    const slackToken = process.env.DSC_AUTH_TOKEN;

    if (slackToken != requestequestToken) {
      return reject({ status: 401, body: { you: "can't do that" } });
    }

    return resolve(body);
  }).catch((e) => {
    console.error(`Auth failure: Body: "${body}", Headers: ${headers}`);
    res.status(e.status);
    res.send(e.body);
  });
};

app.post("/api/v1/app", (req, res) => {
  authHandler(res, req.body).then((_) => {
    res.send(startApp(req.body));
  });
});

app.post("/api/v1/interact", async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  authHandler(res, payload)
    .then((body) => {
      res.send(getInteraction(body));
    })
    .catch((e) => {
      console.error("Oops!", e);
      res.status(500);
      res.send({ woops: "something terrible is afoot" });
    });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
