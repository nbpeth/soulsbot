const config = require("./config");
const qs = require("qs");
const {default: axios} = require("axios");

const getOauthToken = (code) => {
    const data = {
        client_id: config.env.clientId,
        client_secret: config.env.clientSecret,
        code: code,
        redirect_url: config.urls.greatJob,
    };
    const options = {
        method: "POST",
        data: qs.stringify(data),
        headers: {"content-type": "application/x-www-form-urlencoded"},
        url: config.urls.slackTokenUrl,
    };

    return axios(options)
        .then((authResponse) => {
            const {ok, error, access_token} = authResponse.data;

            if (ok === false) {
                console.error("Unable to get access token from authResponse!", error);
                return Promise.reject(error);
            }

            // get team info of requesting account and redirect to their slack
            const _options = {
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    authorization: `Bearer ${access_token}`,
                },
                url: config.urls.slackTeamInfoUrl,
            };

            return axios(_options)
        })
}

module.exports = {
    getOauthToken
}
