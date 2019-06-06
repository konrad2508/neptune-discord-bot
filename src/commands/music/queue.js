const commando = require('discord.js-commando');
const {sendOk, sendError} = require('../../helpers/utils.js');

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
        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');
        }
        else if (!message.guild.voiceConnection) {
            sendError(message, "**Bot must be in a voice channel**");
        }
        else if (!servers[message.guild.id]) {
            sendOk(message, "**The queue is empty**");
        }
        else {
            let numberOfSongs = servers[message.guild.id].queue.length + 1;
            let server = servers[message.guild.id];

            let nowPlaying = `\n1. [${server.nowplaying.title}](${server.nowplaying.url}) (currently playing)`;
            if (server.nowplaying.loop) nowPlaying += ' (looped)';

            let queueMessage = server.queue.slice(0, 9).map((e, id) => `${id + 2}. [${e.title}](${e.url})`);
            queueMessage.unshift(nowPlaying);
            if (numberOfSongs > 10) queueMessage.push(`\nTotal number of songs: ${numberOfSongs}`);

            sendOk(message, `**Currently in queue${queueMessage.join('\n')}**`);
        }
    }
}

module.exports = QueueCommand;