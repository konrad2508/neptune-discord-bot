import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { findSong, findPlaylistVideos, playSong } from '../../helpers/musicplayer';
import { optionRegex, youtubePlaylistLinkRegex, youtubeWatchLinkWithPlaylistRegex } from '../../helpers/strings';
import { sendError, sendOk } from '../../helpers/utils';

const playlistOptions = ['-pl', '--playlist'];

class PlayCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'play',
            group: 'music',
            memberName: 'play',
            argsPromptLimit: 0,
            description: 'Plays song',
            aliases: ['p'],
            args: [
                {
                    key: 'opt',
                    type: 'string',
                    prompt: 'Option',
                    default: '',
                },
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the song',
                    default: '',
                },
            ]
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage, { opt, url }: PlayRunArgs): Promise<any> {
        const serverId = message.guild.id;
        const server = global.servers[serverId];

        const [option, link] = this.fixArgs(opt, url);

        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');

            return;
        }

        if (!server) {
            sendError(message, '**Bot must be in a voice channel**');

            return;
        }

        if (!link) {
            sendError(message, '**Specify URL of the song**');

            return;
        }

        if (option) {
            this.handleOptionCase(message, option, link);
        } else {
            this.handleOptionlessCase(message, link);
        }
    }

    private fixArgs(arg1: string, arg2: string): string[] {
        if (arg1.match(optionRegex)) {
            return [arg1, arg2];
        } else {
            return ['', `${arg1} ${arg2}`.trim()];
        }
    }

    private async handleOptionCase(message: CommandoMessage, option: string, link: string): Promise<void> {
        if (!playlistOptions.some(e => e === option)) {
            sendError(message, '**Unknown option**');

            return;
        }

        if (!link.match(youtubePlaylistLinkRegex) && !link.match(youtubeWatchLinkWithPlaylistRegex)) {
            sendError(message, '**Specified URL does not leads to a playlist. Try adding it to the queue without --playlist option.**');

            return;
        }

        const serverId = message.guild.id;
        const server = global.servers[serverId];

        const { songs, deletedSongs } = await findPlaylistVideos(link);

        if (songs.length == 0) {
            sendError(message, '**Could not add the playlist to the queue**');

            return;
        }

        let okMessage = `**Added ${songs.length} songs to the queue`;
        if (deletedSongs > 0) {
            okMessage += `\nCould not add ${deletedSongs} songs`;
        }
        okMessage += '**';

        if (server.songQueue) {
            server.songQueue = [...server.songQueue, ...songs];
            sendOk(message, okMessage);
        } else {
            server.songQueue = songs;
            sendOk(message, okMessage);
            playSong(message);
        }
    }

    private async handleOptionlessCase(message: CommandoMessage, link: string): Promise<void> {
        if (link.match(youtubePlaylistLinkRegex)) {
            sendError(message, '**Specified URL leads to a playlist. Try adding it to the queue with --playlist option.**');

            return;
        }

        const serverId = message.guild.id;
        const server = global.servers[serverId];

        const song = await findSong(link);

        if (!song) {
            sendError(message, '**Could not add that song, add a different song**');

            return;
        }

        if (server.songQueue) {
            server.songQueue.push(song);
            sendOk(message, `**Added [${song.title}](${song.url}) to the queue**`);
        } else {
            server.songQueue = [song];
            playSong(message);
        }
    }
}

export = PlayCommand;
