/* globals servers */
const commando = require('discord.js-commando');
const { sendOk, sendError } = require('../../helpers/utils.js');

class PurgeCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      group: 'music',
      memberName: 'purge',
      description: 'Clears the song queue'
    });
  }

  async run(message) {
    const server = servers[message.guild.id];

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
    else if (!server) sendError(message, '**No song is currently playing**');
    else {
      server.queue = [];

      if (server.nowplaying.loop) server.nowplaying.loop = false;
      server.dispatcher.end();
      
      sendOk(message, '**Cleared the queue**');
    }
  }
}

module.exports = PurgeCommand;
