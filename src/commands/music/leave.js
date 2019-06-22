/* globals servers connections */
const commando = require('discord.js-commando');
const { sendOk, sendError } = require('../../helpers/utils.js');

class LeaveCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      group: 'music',
      memberName: 'leave',
      description: 'Leaves voice channel',
    });
  }

  async run(message) {
    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.guild.voiceConnection) sendError(message, '**Bot is not in a voice channel**');
    else {
      message.guild.voiceConnection.disconnect();
      connections[message.guild.id] = null;

      if (servers[message.guild.id]) servers[message.guild.id] = null;

      sendOk(message, '**Left voice channel**');
    }
  }
}

module.exports = LeaveCommand;
