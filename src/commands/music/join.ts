import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils';
import fs from 'fs';

class JoinCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'join',
            group: 'music',
            memberName: 'join',
            description: 'Joins voice channel',
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage): Promise<any> {
        const serverId = message.guild.id;

        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }

        if (!message.member.voice.channel) {
            sendError(message, '**You must be in a voice channel**');

            return;
        }

        if (global.servers[serverId]) {
            sendError(message, '**Bot is already in a voice channel**');

            return;
        }

        global.servers[serverId] = {
            connection: await message.member.voice.channel.join(),
            isQueueLocked: false
        };

        const greetingStream = fs.createReadStream('./static/nepu.mp3');
        global.servers[serverId].connection.play(greetingStream).setVolume(25);

        sendOk(message, '**Joined voice channel**');
    }
}

export = JoinCommand;
