const qs = require("qs");
const { default: axios } = require("axios");

const clientId = process.env.DSC_CLIENT_ID;
const clientSecret = process.env.DSC_CLIENT_SECRET;

const host = process.env.HOST ?? "http://localhost:8080";

const redirectUrl = `${host}/api/v1/oauth/token`;
const greatJob = `${host}/api/v1/health`;
const slackAuthUrl = "https://slack.com/oauth/v2/authorize";
const slackTokenUrl = "https://slack.com/api/oauth.v2.access";
const slackTeamInfoUrl = "https://slack.com/api/team.info"

module.exports = (app) => {
  app.get("/api/v1/oauth/authorize", (req, res, next) => {
    res.redirect(
      `${slackAuthUrl}?client_id=${clientId}&scope=commands+team%3Aread&redirect_uri=${redirectUrl}`
    );
    next();
  });

  app.get("/api/v1/oauth/token", (req, res, next) => {
    const query = req.query;
    const { code, state } = query;

    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_url: greatJob,
    };
    const options = {
      method: "POST",
      data: qs.stringify(data),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      url: slackTokenUrl,
    };

    axios(options)
      .then((authResponse) => {
        const {
          access_token,
        } = authResponse.data;

        const { ok, error } = authResponse;
        console.log("ok", ok, err)

        if(!ok) {
          return Promise.reject(error);
        }

        const options = {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            authorization: `Bearer ${access_token}`,
          },
          url: slackTeamInfoUrl,
        };

        return axios(options)
          .then((r) => {
            if (r.data.ok) {
              res.redirect(r.data.team.url);
              res.end();
            } else {
              console.log("info req failed", r.data);
              res.redirect(greatJob);
              res.end();
            }
          })
          .catch((e) => {
            console.error("Error when getting team info", e);
            res.redirect(greatJob);
            res.end();
          });
      })
      .catch((e) => {
        console.error("OAuth Error", e);
        res.status(500);
        res.send(e.message);
      });
  });
};
