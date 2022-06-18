const { default: axios } = require("axios");
const express = require("express");
const app = express();
const { authHandler } = require("./auth");
const port = process.env.PORT || 8080;
const { getInteraction, startApp } = require("./interaction");
require("./oauthController")(app);

app.use(express.json());
app.use(express.urlencoded());

app.get("/api/v1/health", (req, res) => {
  res.send({ feelin: "fine" });
});

app.post("/api/v1/app", (req, res) => {
  authHandler(res, req.body, req.headers).then((_) => {
    res.send(startApp(req.body));
  });
});

app.post("/api/v1/interact", async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  authHandler(res, payload, req.headers)
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
