const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Reaction = require('../../schema/reaction.js');
const { sendError } = require('../../helpers/utils.js');

class ListCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'list',
      group: 'reactions',
      memberName: 'list',
      description: 'Returns list of reactions',
      aliases: ['l'],
    });
  }

  async run(message) {
    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else {
      Reaction.find({ server: message.guild.id }, 'name').exec()
        .then(ret => listReactions(message, ret))
        .catch((err) => {
          sendError(message, '**Something went wrong, try again**');
          console.log(err.content);
        });
    }
  }
}

const listReactions = (message, ret) => {
  const embed = new RichEmbed()
    .setTitle('List of reactions')
    .setColor('#00FF00');

  const description = ret.length
    ? ret.map(e => e.name).sort((a, b) => ((a.toLowerCase() < b.toLowerCase()) ? -1 : 1)).join('\n')
    : 'No reactions added!';

  embed.setDescription(description);

  message.channel.send(embed)
    .then(msg => msg.delete(15000));
  message.delete(100);
};

module.exports = ListCommand;
