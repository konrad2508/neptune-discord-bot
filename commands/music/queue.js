const commando = require('discord.js-commando');
const {sendOk, sendError} = require('../../utils.js');

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
        if (message.guild.voiceConnection) {
            let server = servers[message.guild.id];
            if (server) {
                let queueMessage = `**\n1. [${server.nowplaying.title}](${server.nowplaying.url}) (currently playing)`;
                if (server.nowplaying.loop) queueMessage += ' (looped)';

                for (let i = 0; i < server.queue.length; i++){
                    queueMessage += `\n${i+2} [${server.queue[i].title}](${server.queue[i].url})`;
                }

                queueMessage += '**';

                sendOk(message, `**Currently in queue${queueMessage}`);
            }
            else {
                sendOk(message, "**The queue is empty**");
            }
        }
        else {
            sendError(message, "**Bot must be in a voice channel**");
        }

    }
}

module.exports = QueueCommand;