const commando = require('discord.js-commando');
const valid = require('valid-url');
const Reaction = require('../../schema/reaction.js');
const { sendOk, sendError } = require('../../helpers/utils.js');

class AddCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'add',
      group: 'reactions',
      memberName: 'add',
      argsPromptLimit: 0,
      description: 'Adds reaction',
      aliases: ['a'],
      args: [
        {
          key: 'name',
          type: 'string',
          prompt: 'Name of the reaction to add',
          default: '',
        },
        {
          key: 'url',
          type: 'string',
          prompt: 'Url of the reaction to add',
          default: '',
        },
      ],
    });
  }

  async run(message, { name, url }) {
    [url] = url.split(' ');

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!name) sendError(message, '**Specify reaction name to add**');
    else if (!url) sendError(message, '**Specify URL of the reaction**');
    else if (!valid.isWebUri(url)) sendError(message, '**Invalid URL**');
    else {
      Reaction.find({ name, server: message.guild.id }).exec()
        .then((ret) => {
          if (ret.length) sendError(message, '**Reaction with that name already exists**');
          else persistReaction(message, name, url);
        })
        .catch((err) => {
          sendError(message, '**Something went wrong, try again or specify a different reaction**');
          console.log(err);
        });
    }
  }
}

const persistReaction = (message, name, url) => {
  Reaction.create({ name, url, server: message.guild.id })
    .then(() => sendOk(message, '**Saved the reaction**'))
    .catch((err) => {
      sendError(message, '**Something went wrong, try again or specify a different reaction**');
      console.log(err);
    });
};

module.exports = AddCommand;
