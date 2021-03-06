import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils';
import config from '../../config';

class LeaveCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'leave',
            group: 'music',
            memberName: 'leave',
            description: 'Leaves voice channel',
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage): Promise<any> {
        const serverId = message.guild.id;
        const server = global.servers[serverId];

        if (server.isQueueLocked && !config.ADMIN.some(e => e === message.author.id)) {
            sendError(message, '**The queue is locked**');

            return;
        }

        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }

        if (!global.servers[serverId]) {
            sendError(message, '**Bot is not in a voice channel**');

            return;
        }

        message.guild.voice.connection.disconnect();
        delete global.servers[serverId];

        sendOk(message, '**Left voice channel**');
    }
}

export = LeaveCommand;
