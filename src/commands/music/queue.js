/* globals servers */
const commando = require('discord.js-commando');
const { sendOk, sendError } = require('../../helpers/utils.js');

class QueueCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      group: 'music',
      memberName: 'queue',
      description: 'Shows song queue',
      aliases: ['q'],
    });
  }

  async run(message) {
    const server = servers[message.guild.id];

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
    else if (!server) sendOk(message, '**The queue is empty**');
    else {
      const numberOfSongs = servers[message.guild.id].queue.length + 1;

      let nowPlaying = `\n1. [${server.nowplaying.title}](${server.nowplaying.url}) (currently playing)`;
      if (server.nowplaying.loop) nowPlaying += ' (looped)';

      const queueMessage = server.queue.slice(0, 9).map((e, id) => `${id + 2}. [${e.title}](${e.url})`);
      if (numberOfSongs > 10) queueMessage.push(`\nTotal number of songs: ${numberOfSongs}`);
      queueMessage.unshift(nowPlaying);

      sendOk(message, `**Currently in queue${queueMessage.join('\n')}**`);
    }
  }
}

module.exports = QueueCommand;
