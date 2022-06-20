const host = process.env.HOST ?? "http://localhost:8080";

const env = {
    clientId: process.env.DSC_CLIENT_ID,
    clientSecret: process.env.DSC_CLIENT_SECRET
}

const urls = {
    redirectUrl: `${host}/api/v1/oauth/token`,
    greatJob: `${host}/api/v1/health`,
    slackAuthUrl: "https://slack.com/oauth/v2/authorize",
    slackTokenUrl: "https://slack.com/api/oauth.v2.access",
    slackTeamInfoUrl: "https://slack.com/api/team.info",
}

module.exports = {
    env,
    urls
}
