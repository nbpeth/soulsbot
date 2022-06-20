const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const controllers = require("./controllers");

app.use(express.json());
app.use(express.urlencoded());

app.get("/api/v1/health", controllers.v1.health);
app.post("/api/v1/app", controllers.v1.postApp);
app.post("/api/v1/interact", controllers.v1.interact);

app.get("/api/v1/oauth/authorize", controllers.v1.oauthAuthorize);
app.get("/api/v1/oauth/token", controllers.v1.oathGetTokenAndRedirect);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
