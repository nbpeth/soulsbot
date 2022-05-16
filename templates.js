const { messageTemplates, conjunctions, categories } = require("./content");

const textOption = (text) => {
  return {
    text: {
      type: "plain_text",
      text,
    },
    value: text,
  };
};

const actions = (formValid) => {
  const options = {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        value: "cancel",
        action_id: "cancel",
      },
    ],
  };

  if (formValid) {
    options.elements.push({
      type: "button",
      text: {
        type: "plain_text",
        text: "Send",
        emoji: true,
      },
      value: "send",
      action_id: "send",
    });
  }

  return options;
};

const getSelectBlock = ({
  label,
  block_id,
  action_id,
  options,
  initial_option,
}) => {
  return {
    block_id,
    type: "section",
    text: {
      type: "mrkdwn",
      text: label,
    },
    accessory: {
      type: "static_select",
      placeholder: {
        type: "plain_text",
        text: "-",
        emoji: true,
      },
      ...(initial_option && {
        initial_option: {
          ...initial_option,
        },
      }),
      options: options.map((text) => textOption(text)),
      action_id,
    },
  };
};

const maybeSelectedOption = ({ values, key }) => {
  return (
    values &&
    values[blockParams[key].block_id] &&
    values[blockParams[key].block_id][blockParams[key].action_id] &&
    values[blockParams[key].block_id][blockParams[key].action_id][
      "selected_option"
    ]
  );
};

const blockKeys = {
  messageFormat: "messageFormat",
  words1: "words1",
  words2: "words2",
  template1: "template1",
  template2: "template2",
  category1: "category1",
  category2: "category2",
  conjunction: "conjunction",
};

const blockParams = {
  [blockKeys.messageFormat]: {
    label: "Message Format",
    block_id: "messageFormat",
    action_id: "messageFormat-action",
  },
  [blockKeys.template1]: {
    label: "Template",
    block_id: "template1",
    action_id: "template1-action",
  },
  [blockKeys.template2]: {
    label: "Template",
    block_id: "template2",
    action_id: "template2-action",
  },
  [blockKeys.words1]: {
    label: "Words",
    block_id: "words1",
    action_id: "words1-action",
  },
  [blockKeys.words2]: {
    label: "Words",
    block_id: "words2",
    action_id: "words2-action",
  },
  [blockKeys.category1]: {
    label: "Category",
    block_id: "category1",
    action_id: "category1-action",
  },
  [blockKeys.category2]: {
    label: "Category",
    block_id: "category2",
    action_id: "category2-action",
  },
  [blockKeys.conjunction]: {
    label: "Conjunctions",
    block_id: "conjunction",
    action_id: "conjunction-action",
  },
};

const messageFormatOptions = {
  A: "A",
  B: "B",
};

const getMessageFormat = (values) => {
  return (
    maybeSelectedOption({
      values,
      key: blockKeys.messageFormat,
    }) ?? textOption(messageFormatOptions.A)
  );
};

const getValueFrom = (values) => (key) =>
  ({
    [blockKeys.words1]: maybeSelectedOption({
      values,
      key: blockKeys.words1,
    }),
    [blockKeys.words2]: maybeSelectedOption({
      values,
      key: blockKeys.words2,
    }),
    [blockKeys.template1]: maybeSelectedOption({
      values,
      key: blockKeys.template1,
    }),
    [blockKeys.template2]: maybeSelectedOption({
      values,
      key: blockKeys.template2,
    }),
    [blockKeys.conjunction]: maybeSelectedOption({
      values,
      key: blockKeys.conjunction,
    }),
  }[key]);

const computedBlocks = {
  words1: (categoryWords, maybeSelected) =>
    getSelectBlock({
      label: blockParams.words1.label,
      block_id: blockParams.words1.block_id,
      action_id: blockParams.words1.action_id,
      options: categoryWords,
      initial_option: maybeSelected,
    }),
  words2: (categoryWords, maybeSelected) =>
    getSelectBlock({
      label: blockParams.words2.label,
      block_id: blockParams.words2.block_id,
      action_id: blockParams.words2.action_id,
      options: categoryWords,
      initial_option: maybeSelected,
    }),
};

const definedBlocks = {
  template1Block: (maybeSelected) =>
    getSelectBlock({
      label: blockParams.template1.label,
      block_id: blockParams.template1.block_id,
      action_id: blockParams.template1.action_id,
      options: messageTemplates,
      initial_option: maybeSelected,
    }),
  template2Block: (maybeSelected) =>
    getSelectBlock({
      label: blockParams.template2.label,
      block_id: blockParams.template2.block_id,
      action_id: blockParams.template2.action_id,
      options: messageTemplates,
      initial_option: maybeSelected,
    }),
  category1Block: (maybeSelected) =>
    getSelectBlock({
      label: blockParams.category1.label,
      block_id: blockParams.category1.block_id,
      action_id: blockParams.category1.action_id,
      options: Object.keys(categories),
      initial_option: maybeSelected,
    }),
  category2Block: (maybeSelected) =>
    getSelectBlock({
      label: blockParams.category2.label,
      block_id: blockParams.category2.block_id,
      action_id: blockParams.category2.action_id,
      options: Object.keys(categories),
      initial_option: maybeSelected,
    }),
  conjunctionBlock: (maybeSelected) =>
    getSelectBlock({
      label: blockParams.conjunction.label,
      block_id: blockParams.conjunction.block_id,
      action_id: blockParams.conjunction.action_id,
      options: conjunctions,
      initial_option: maybeSelected,
    }),
};

const getCategoryWordsFrom = (maybeSelectedCategory) => {
  if (maybeSelectedCategory) {
    return categories[maybeSelectedCategory.value];
  }

  return undefined;
};

const actionButtons = (isValid) => {
  return actions(isValid);
};

const getTemplate = (values = {}) => {
  const initial_option = getMessageFormat(values);

  const messageFormatBlock = getSelectBlock({
    label: blockParams.messageFormat.label,
    block_id: blockParams.messageFormat.block_id,
    action_id: blockParams.messageFormat.action_id,
    options: [messageFormatOptions.A, messageFormatOptions.B],
    initial_option,
  });

  const blocks = [messageFormatBlock];

  switch (initial_option.value) {
    case messageFormatOptions.A:
      return templateA(values, blocks);
    case messageFormatOptions.B:
      return templateB(values, blocks);
    default:
      return templateA(values, blocks);
  }
};

const templateA = (values = {}, blocks) => {
  const maybeSelectedTemplate = maybeSelectedOption({
    values,
    key: blockKeys.template1,
  });
  const maybeSelectedCategory = maybeSelectedOption({
    values,
    key: blockKeys.category1,
  });
  const maybeSelectedWord1 = maybeSelectedOption({
    values,
    key: blockKeys.words1,
  });

  blocks.push(definedBlocks.template1Block(maybeSelectedTemplate));
  blocks.push(definedBlocks.category1Block(maybeSelectedCategory));

  // repeatable
  const categoryWords = getCategoryWordsFrom(maybeSelectedCategory);
  if (categoryWords) {
    
    blocks.push(computedBlocks.words1(categoryWords, maybeSelectedWord1));
  }

  const formComplete = maybeSelectedCategory && maybeSelectedWord1;
  blocks.push(actionButtons(formComplete));

  return {
    blocks: blocks,
  };
};

const templateB = (values = {}, blocks) => {
  const maybeSelectedTemplate = maybeSelectedOption({
    values,
    key: blockKeys.template1,
  });
  const maybeSelectedCategory = maybeSelectedOption({
    values,
    key: blockKeys.category1,
  });
  const maybeSelectedWord1 = maybeSelectedOption({
    values,
    key: blockKeys.words1,
  });
  const maybeSelectedTemplate2 = maybeSelectedOption({
    values,
    key: blockKeys.template2,
  });
  const maybeSelectedCategory2 = maybeSelectedOption({
    values,
    key: blockKeys.category2,
  });
  const maybeSelectedConjunction = maybeSelectedOption({
    values,
    key: blockKeys.conjunction,
  });
  const maybeSelectedWord2 = maybeSelectedOption({
    values,
    key: blockKeys.words2,
  });

  blocks.push(definedBlocks.template1Block(maybeSelectedTemplate));
  blocks.push(definedBlocks.category1Block(maybeSelectedCategory));

  // repeatable
  const categoryWords = getCategoryWordsFrom(maybeSelectedCategory);
  
  if (categoryWords) {
    blocks.push(computedBlocks.words1(categoryWords, maybeSelectedWord1));
  }
  

  blocks.push(definedBlocks.conjunctionBlock(maybeSelectedConjunction));
  blocks.push(definedBlocks.template2Block(maybeSelectedTemplate2));
  blocks.push(definedBlocks.category2Block(maybeSelectedCategory2));

  const category2Words = getCategoryWordsFrom(maybeSelectedCategory2);
  if (category2Words) {
    blocks.push(computedBlocks.words2(category2Words, maybeSelectedWord2));
  }

  const formComplete =
    maybeSelectedCategory &&
    maybeSelectedWord1 &&
    maybeSelectedConjunction &&
    maybeSelectedTemplate2 &&
    maybeSelectedCategory2 &&
    maybeSelectedWord2;
  blocks.push(actionButtons(formComplete));

  return {
    blocks: blocks,
  };
};

const replaceWildcard = (template, substitution) => {
  return template.replace("****", substitution);
};

const frame = [...Array(40).keys()].map((_) => "*").join("");
const wrapMessage = (content) => {
  return [frame, content.join("\n"), "", frame].join("\n");
};

const buildTemplateA = (getValue) => {
  const word1 = getValue(blockKeys.words1).value;
  const template1 = getValue(blockKeys.template1).value;
  const message = replaceWildcard(template1, word1);

  return { text: wrapMessage([message]) };
};

const buildTemplateB = (getValue) => {
  const word1 = getValue(blockKeys.words1).value;
  const template1 = getValue(blockKeys.template1).value;

  const conjunction = getValue(blockKeys.conjunction).value;
  const word2 = getValue(blockKeys.words2).value;
  const template2 = getValue(blockKeys.template2).value;

  return {
    text: wrapMessage([
      replaceWildcard(template1, word1),
      conjunction,
      replaceWildcard(template2, word2),
    ]),
  };
};

const templateBuilder = (getValue, selectedFormat) =>
  ({
    [messageFormatOptions.A]: () => buildTemplateA(getValue),
    [messageFormatOptions.B]: () => buildTemplateB(getValue),
  }[selectedFormat]);

const buildMessage = (values = {}) => {
  const messageFormat = getMessageFormat(values).value;
  const getValue = getValueFrom(values);

  return templateBuilder(getValue, messageFormat)();
};

const getHelp = () => {
  return wrapMessage(
    [
      "don't give up, skeleton!", "therefore", "try confidence"
    ]
  )
}

module.exports = {
  buildMessage,
  getHelp,
  getSelectBlock,
  getTemplate,
  textOption,
};
