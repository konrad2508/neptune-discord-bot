import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError, songTime } from '../../helpers/utils';

class NowPlayingCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'nowplaying',
            group: 'music',
            memberName: 'nowplaying',
            description: 'Prints info about currently playing song',
            aliases: ['np'],
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

        if (!server.nowPlaying) {
            sendError(message, '**No song is currently playing**');

            return;
        }

        const { totalStreamTime } = server.dispatcher;
        const { title, url } = server.nowPlaying;
        const length = server.nowPlaying.duration;

        let description = `\nCurrent time: \`${songTime(totalStreamTime, length)}\``;
        if (server.nowPlaying.playlist) {
            description += `\nPlaylist: ${server.nowPlaying.playlist}`;
        }
        if (server.nowPlaying.isLooping) {
            description += '\nLooped';
        }

        sendOk(message, `**Now playing: [${title}](${url})${description}**`);
    }
}

export = NowPlayingCommand;
