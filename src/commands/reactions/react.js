const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Reaction = require('../../schema/reaction.js');
const { sendError } = require('../../helpers/utils.js');

class ReactCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'react',
      group: 'reactions',
      memberName: 'react',
      argsPromptLimit: 0,
      description: 'Reacts with specified reaction',
      aliases: ['r'],
      args: [
        {
          key: 'name',
          type: 'string',
          prompt: 'Name of the reaction',
          default: '',
        },
      ],
    });
  }

  async run(message, { name }) {
    [name] = name.split(' ');

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!name) sendError(message, '**Specify reaction name**');
    else {
      Reaction.findOne({ name, server: message.guild.id }).exec()
        .then((ret) => {
          if (!ret) sendError(message, '**Reaction does not exist**');
          else react(message, ret);
        })
        .catch((err) => {
          sendError('**Something went wrong, try again or specify a different reaction**');
          console.log(err);
        });
    }
  }
}

const react = (message, ret) => {
  const embed = new RichEmbed()
    .setColor('#00FF00')
    .setTitle(`${message.member.user.tag} reacts with ${ret.name}`)
    .setImage(ret.url);

  message.channel.send(embed);
  message.delete(100);
};

module.exports = ReactCommand;
