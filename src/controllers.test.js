const controllers = require("./controllers");
const auth = require("./auth");
const interaction = require("./interaction");
const slackClient = require("./slackClient");

const fakeUrls = {
    greatJob: "greatJob",
    redirectUrl: "redirectUrl",
    slackAuthUrl: "slackAuthUrl",
    slackTokenUrl: "slackTokenUrl",
    slackTeamInfoUrl: "slackTeamInfoUrl",
}
const fakeEnv = {
    clientId: "clientId",
    clientSecret: "clientSecret"
}
jest.mock("./config", () => ({
    urls: fakeUrls,
    env: fakeEnv
}))

describe("controllers", () => {
    const redirect = jest.fn();
    const send = jest.fn();
    const status = jest.fn();
    const end = jest.fn();
    const next = jest.fn();
    const headers = jest.fn();
    const query = "?query=ok&hats=ridiculous";

    const authHandlerSpy = jest.spyOn(auth, "authHandler")
    const getInteractionSpy = jest.spyOn(interaction, "getInteraction")
    const startAppSpy = jest.spyOn(interaction, "startApp")
    const getOauthTokenSpy = jest.spyOn(slackClient, "getOauthToken")


    const request = () => ({
        body: {},
        headers,
        query
    })
    const response = () => ({
        end,
        next,
        redirect,
        send,
        status
    });


    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("health", () => {
        it("must be healthy", async () => {
            await controllers.v1.health(request(), response());

            expect(send).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({feelin: "fine"})
        });
    });

    describe("interact", () => {
        it("must catch bad body payload json and return error", async () => {
            await controllers.v1.interact(request(), response());

            expect(send).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(500);
            expect(send).toHaveBeenCalledWith({error: "missing payload; could not parse json"});
        });

        it("must handle auth error", async () => {
            const req = request();
            req.body = {payload: "{}"};
            authHandlerSpy.mockImplementation(() => Promise.reject());

            await controllers.v1.interact(req, response());

            expect(send).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(401);
            expect(send).toHaveBeenCalledWith({you: "can't do that"});
        });

        it("must return interaction response from body on successful auth and good json", async () => {
            const expected = {inter: "action"};
            const req = request();
            req.body = {payload: "{}"};
            authHandlerSpy.mockImplementation(() => Promise.resolve());
            getInteractionSpy.mockImplementation(() => expected);

            await controllers.v1.interact(req, response());

            expect(send).toHaveBeenCalledTimes(1);
            expect(send).toHaveBeenCalledWith(expected);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(200);
        });
    });

    describe("postApp", () => {
        it("must send initial template if auth passes", async () => {
            const req = request()
            const res = response()
            req.body = {payload: "bzzz"}
            authHandlerSpy.mockImplementation(() => Promise.resolve());
            startAppSpy.mockImplementation(() => ({okey: "dokey"}));

            await controllers.v1.postApp(req, response());

            expect(authHandlerSpy).toHaveBeenCalledTimes(1);
            expect(authHandlerSpy).toHaveBeenCalledWith(res, req.body, req.headers);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(200);
            expect(send).toHaveBeenCalledWith({okey: "dokey"})
        });
    });

    describe("oauthAuthorize", () => {
        it("must redirect to slack auth url with correct params", async () => {

            await controllers.v1.oauthAuthorize(request(), response(), next);

            expect(redirect).toHaveBeenCalledTimes(1);
            expect(redirect).toHaveBeenCalledWith(`${fakeUrls.slackAuthUrl}?client_id=${fakeEnv.clientId}&scope=commands+team%3Aread&redirect_uri=${fakeUrls.redirectUrl}`);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("oathGetToken", () => {
        const teamUrl = "https://url.biz";
        it("must redirect to team url if response is OK", async () => {
            getOauthTokenSpy.mockImplementation(() => Promise.resolve({
                data: {
                    ok: true,
                    team: {
                        url: teamUrl
                    }
                }
            }))

            await controllers.v1.oathGetTokenAndRedirect(request(), response());

            expect(redirect).toHaveBeenCalledTimes(1);
            expect(redirect).toHaveBeenCalledWith(teamUrl);
            expect(end).toHaveBeenCalledTimes(1);
        });

        it("must redirect to fallback url if response is NOT OK", async () => {
            getOauthTokenSpy.mockImplementation(() => Promise.resolve({
                data: {
                    ok: false,
                    team: {
                        url: teamUrl
                    }
                }
            }))

            await controllers.v1.oathGetTokenAndRedirect(request(), response());

            expect(redirect).toHaveBeenCalledTimes(1);
            expect(redirect).toHaveBeenCalledWith(fakeUrls.greatJob);
            expect(end).toHaveBeenCalledTimes(1);
        });

        it("must redirect to fallback url if exception thrown", async () => {
            getOauthTokenSpy.mockImplementation(() => Promise.reject("pffft"))

            await controllers.v1.oathGetTokenAndRedirect(request(), response());

            expect(redirect).toHaveBeenCalledTimes(1);
            expect(redirect).toHaveBeenCalledWith(fakeUrls.greatJob);
            expect(end).toHaveBeenCalledTimes(1);
        });
    });
});
