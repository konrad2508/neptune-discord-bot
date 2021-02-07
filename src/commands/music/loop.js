/* globals servers */
const commando = require('discord.js-commando');
const { sendOk, sendError } = require('../../helpers/utils.js');

class LoopCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      description: 'Loops currently playing song',
    });
  }

  async run(message) {
    const server = servers[message.guild.id];

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
    else if (!server) sendError(message, '**No song is currently being played**');
    else loop(message);
  }
}

const loop = (message) => {
  const server = servers[message.guild.id];

  if (server.nowplaying.loop) {
    server.nowplaying.loop = false;
    sendOk(message, '**Unlooping currently playing song**');
  } else {
    server.nowplaying.loop = true;
    sendOk(message, '**Looping currently playing song**');
  }
};

module.exports = LoopCommand;
