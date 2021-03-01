import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import config from '../../config';
import { sendError, sendOk } from '../../helpers/utils';

class LockCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'lock',
            group: 'music',
            memberName: 'lock',
            description: 'Locks the queue',
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage): Promise<any> {
        const serverId = message.guild.id;
        const server = global.servers[serverId];

        if (!config.ADMIN.some(e => e === message.author.id)) {
            sendError(message, '**You do not have access to this command**');

            return;
        }

        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }

        if (!server.isQueueLocked) {
            server.isQueueLocked = true;

            sendOk(message, '**Locked the queue**');
        } else {
            server.isQueueLocked = false;

            sendOk(message, '**Unlocked the queue**');
        }
    }
}

export = LockCommand;
