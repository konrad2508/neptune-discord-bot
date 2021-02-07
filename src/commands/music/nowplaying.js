/* globals servers */
const commando = require('discord.js-commando');
const { sendOk, sendError, songTime } = require('../../helpers/utils.js');

class NowPlayingCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      description: 'Prints info about currently playing song',
      aliases: ['np'],
    });
  }

  async run(message) {
    const server = servers[message.guild.id];

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
    else if (!server) sendError(message, '**No song is currently playing**');
    else {
      const { totalStreamTime } = server.dispatcher;
      const { title } = server.nowplaying;
      const length = server.nowplaying.duration;
      const { url } = server.nowplaying;

      let description = `\nCurrent time: \`${songTime(totalStreamTime, length)}\``;
      if (server.nowplaying.playlist) description += `\nPlaylist: ${server.nowplaying.playlist}`;
      if (server.nowplaying.loop) description += '\nLooped';

      sendOk(message, `**Now playing: [${title}](${url})${description}**`);
    }
  }
}

module.exports = NowPlayingCommand;
