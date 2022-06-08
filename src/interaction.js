const { buildMessage, getAbout, getHelp, getTemplate } = require("./templates");

const axios = require("axios");

const options = {
  help: "help",
  about: "about",
};

const action = {
  send: "send",
  cancel: "cancel",
};

const startApp = (body) => {
  const { text: helperText = "" } = body;

  switch (helperText.toLowerCase()) {
    case options.help:
      return {
        text: getHelp(),
      };
    case options.about:
      return {
        text: getAbout(),
      };

    default:
      return {
        ...getTemplate(),
        response_type: "ephemeral",
      };
  }
};

const handleCancel = async (response_url) => {
  return axios
    .post(response_url, {
      delete_original: "true",
      response_type: "ephemeral",
    })
    .then((_) => {
      return { ok: true };
    });
};

const handleSend = async (response_url, state) => {
  const values = state.values;
  const template = buildMessage(values);

  return axios
    .post(response_url, {
      ...template,
      delete_original: "true",
      response_type: "in_channel",
    })
    .then((_) => {
      return { ok: true };
    });
};

const handleInteraction = async (response_url, state) => {
  const message = getTemplate(state.values);

  return axios
    .post(response_url, {
      ...message,
      replace_original: "true",
      response_type: "ephemeral",
    })
    .then((_) => {
      return { ok: true };
    });
};

const findAction = (actions) => (actioName) =>
  actions.find((a) => a.action_id === actioName);

const getInteraction = async (body) => {
  const { response_url, state, actions } = body;
  const isAction = findAction(actions);

  if (isAction(action.cancel)) {
    return handleCancel(response_url);
  } else if (isAction(action.send)) {
    return handleSend(response_url, state);
  } else {
    return handleInteraction(response_url, state);
  }
};

module.exports = {
  getInteraction,
  startApp,
};
