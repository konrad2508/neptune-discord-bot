import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils';
import config from '../../config';

class LoopCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'loop',
            group: 'music',
            memberName: 'loop',
            description: 'Loops currently playing song',
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

        if (!server) {
            sendError(message, '**Bot must be in a voice channel**');

            return;
        }

        if (!server.nowPlaying) {
            sendError(message, '**No song is currently being played**');

            return;
        }

        this.loop(message);
    }

    private loop(message: CommandoMessage): void {
        const serverId = message.guild.id;
        const server = global.servers[serverId];

        if (server.nowPlaying.isLooping) {
            server.nowPlaying.isLooping = false;
            sendOk(message, '**Unlooping currently playing song**');
        } else {
            server.nowPlaying.isLooping = true;
            sendOk(message, '**Looping currently playing song**');
        }
    }
}

export = LoopCommand;
