/* globals servers */
const commando = require('discord.js-commando');
const { sendOk, sendError } = require('../../helpers/utils.js');

class SkipCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skips currently playing song',
      aliases: ['s'],
    });
  }

  async run(message) {
    const server = servers[message.guild.id];

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
    else if (!server) sendError(message, '**No song is currently playing**');
    else {
      if (server.nowplaying.loop) server.nowplaying.loop = false;
      server.dispatcher.end();
      sendOk(message, '**Skipped currently playing song**');
    }
  }
}

module.exports = SkipCommand;
