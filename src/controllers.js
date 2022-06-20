const interaction = require("./interaction");
const auth = require("./auth");
const config = require("./config");
const slackClient = require("./slackClient");

module.exports = {
    v1: {
        health: async (req, res) => {
            res.status(200);
            res.send({feelin: "fine"});
        },
        interact: async (req, res) => {
            try {
                const payload = JSON.parse(req.body.payload);

                return auth.authHandler(res, payload, req.headers)
                    .then((body) => {
                        res.status(200);
                        res.send(interaction.getInteraction(body));
                    })
            } catch (e) {
                console.error(e);
                res.status(500);
                res.send({error: "missing payload; could not parse json"});
            }
        },
        postApp: async (req, res) => {
            auth.authHandler(res, req.body, req.headers).then((_) => {
                res.status(200);
                res.send(interaction.startApp(req.body));
            }).catch(e => {
                res.status(401);
                res.send
            });
        },
        oauthAuthorize: async (req, res, next) => {
            res.redirect(
                `${config.urls.slackAuthUrl}?client_id=${config.env.clientId}&scope=commands+team%3Aread&redirect_uri=${config.urls.redirectUrl}`
            );
            next();
        },
        oathGetTokenAndRedirect: async (req, res) => {
            const query = req.query;
            const {code} = query;

            return slackClient.getOauthToken(code)
                .then((r) => {
                    if (r.data.ok) {
                        res.redirect(r.data.team.url);
                        res.end();
                    } else {
                        console.error("Error when getting team info", r.data);
                        res.redirect(config.urls.greatJob);
                        res.end();
                    }
                })
                .catch((e) => {
                    console.log("info req failed", e);

                    res.redirect(config.urls.greatJob);
                    res.end();
                });
        }
    },
};
