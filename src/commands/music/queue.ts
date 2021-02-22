import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils.js';

class QueueCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: 'Shows song queue',
            aliases: ['q'],
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage): Promise<any> {
        const serverId = message.guild.id;
        const server = global.servers[serverId];

        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');

            return;
        }

        if (!server) {
            sendError(message, '**Bot must be in a voice channel**');

            return;
        }

        if (!server.songQueue) {
            sendOk(message, '**The queue is empty**');

            return;
        }

        const numberOfSongs = server.songQueue.length + 1;

        let nowPlaying = `\n1. [${server.nowPlaying.title}](${server.nowPlaying.url}) (currently playing)`;

        if (server.nowPlaying.isLooping) {
            nowPlaying += ' (looped)';
        }

        const queueMessage = server.songQueue.slice(0, 9).map((e, id) => `${id + 2}. [${e.title}](${e.url})`);

        if (numberOfSongs > 10) {
            queueMessage.push(`\nTotal number of songs: ${numberOfSongs}`);
        }

        queueMessage.unshift(nowPlaying);

        sendOk(message, `**Currently in queue${queueMessage.join('\n')}**`);
    }
}

export = QueueCommand;
