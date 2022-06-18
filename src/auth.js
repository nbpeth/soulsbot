// const crypto = require("crypto");
// const signingSecret = process.env.DSC_SIGNING_SECRET;
const slackToken = process.env.DSC_AUTH_TOKEN;
// const qs = require("qs");

const authHandler = async (res, body, headers) => {
  return new Promise((resolve, reject) => {
    // const slackSignature = headers["x-slack-signature"];
    // const slackTimestamp = headers["x-slack-request-timestamp"];
    // const reqBodyString = qs.stringify(body, { format: "RFC1738" });
    // const [version] = slackSignature.split("=");
    // const cSig = [version, slackTimestamp, reqBodyString].join(":");
    // const calculated = [
    //   version,
    //   crypto
    //     .createHmac("sha256", signingSecret)
    //     .update(cSig, "utf8")
    //     .digest("hex"),
    // ].join("=");

    // if (slackSignature != calculated) {
    //   return reject({ status: 401, body: { you: "can't do that" } });
    // }

    const requestequestToken = body["token"];

    if (requestequestToken != slackToken) {
      return reject({ status: 401, body: { you: "can't do that" } });
    }

    return resolve(body);
  })
};

module.exports = {
  authHandler,
};
