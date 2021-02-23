import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { sendOk, sendError, shuffle } from '../../helpers/utils.js';
import { findSong, playSong } from '../../helpers/musicplayer';
import { optionRegex } from '../../helpers/strings';
import { Playlist } from '../../typings/playlist';
import PlaylistRepository from '../../schema/playlist';
import config from '../../config';

const playOptions = ['-sh', '--shuffle'];

class PlaylistCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'playlist',
            group: 'music',
            memberName: 'playlist',
            description: 'Manages everything playlist related',
            aliases: ['pl'],
            args: [
                {
                    key: 'command',
                    type: 'string',
                    prompt: 'Type of command',
                    default: '',
                },
                {
                    key: 'args',
                    type: 'string',
                    prompt: 'Arguments of the chosen command',
                    default: '',
                },
            ],
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage, { command, args }: PlaylistRunArgs): Promise<any> {
        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');

            return;
        }

        switch (command) {
            case 'play':
            case 'p':
                this.handlePlay(message, args);
                break;
            case 'list':
            case 'l':
                this.handleList(message, args);
                break;
            case 'new':
            case 'n':
                this.handleNew(message, args);
                break;
            case 'add':
            case 'a':
                this.handleAdd(message, args);
                break;
            case 'remove':
            case 'r':
                this.handleRemove(message, args);
                break;
            case 'delete':
            case 'd':
                this.handleDelete(message, args);
                break;
            default:
                this.handleHelp(message);
        }
    }

    private handlePlay(message: CommandoMessage, args: string) {
        const [ opt, playlistName ] = this.fixArgs(args);
    
        if (!message.member.voice.channel) {
            sendError(message, '**Bot must be in a voice channel**');

            return;
        }

        if (!playlistName) {
            sendError(message, '**Specify name of the playlist**');

            return;
        }

        if (opt && !playOptions.some(e => e === opt)) {
            sendError(message, '**Unknown option**');

            return;
        }

        PlaylistRepository.findOne({ name: playlistName, server: message.guild.id }, 'songs').exec()
            .then(ret => this.playFoundPlaylist(message, opt, playlistName, ret))
            .catch((err) => {
                sendError(message, '**Something went wrong, try again later**');
                console.log(err);
            });

    }

    private fixArgs(args: string): string[] {
        const [ opt, playlistName ] = args.split(' ');

        if (opt.match(optionRegex)) {
            return [opt, playlistName];
        } else {
            return ['', `${opt} ${playlistName}`.trim()];
        }
    }

    private playFoundPlaylist(message: CommandoMessage, opt: string, playlistName: string, ret: Playlist): void {
        const serverId = message.guild.id;
        const server = global.servers[serverId];
        
        if (!ret) {
            sendError(message, '**Playlist with that name does not exist**');

            return;
        }

        let droppedQueue = false;
        if (server.songQueue) {
            droppedQueue = true;
        }

        if (opt === '-sh' || opt === '--shuffle') {
            server.songQueue = shuffle(ret.songs);
        } else {
            server.songQueue = ret.songs;
        }

        const shuffled = (opt === '-sh' || opt === '--shuffle')
            ? 'shuffled '
            : '';
        
        const dropped = droppedQueue
            ? 'Purging current queue, playing'
            : 'Playing';

        sendOk(message, `**${dropped} ${shuffled}playlist ${playlistName}**`);
        
        playSong(message);
    }

    private handleList(message: CommandoMessage, args: string): void {
        const [ playlistName ] = args.split(' ');
    
        if (!playlistName) {
            PlaylistRepository.find({ server: message.guild.id }, 'name').exec()
                .then(ret => this.listAll(message, ret))
                .catch((err) => {
                    sendError(message, '**Something went wrong, try again later**');
                    console.log(err);
                });
        } else {
            PlaylistRepository.findOne({ name: playlistName, server: message.guild.id }).exec()
                .then(ret => this.listPlaylist(message, playlistName, ret))
                .catch((err) => {
                    sendError(message, '**Something went wrong, try again later**');
                    console.log(err);
                });
        }
    }

    private listAll(message: CommandoMessage, ret: Playlist[]): void {
        if (ret.length) {
            const embed = new MessageEmbed()
                .setTitle('List of playlists')
                .setColor('#00FF00')
                .setDescription(ret.map(el => el.name).join('\n'));
    
            message.channel.send(embed);
        } else {
            const embed = new MessageEmbed()
                .setTitle('List of playlists')
                .setColor('#00FF00')
                .setDescription('No playlists added');
    
            message.channel.send(embed);
        }
    }

    private listPlaylist(message: CommandoMessage, playlistName: string, ret: Playlist): void {
        if (!ret) {
            sendError(message, '**Playlist with that name does not exist**');

            return;
        }

        if (ret.songs.length) {
            const songList = ret.songs.map((song, id) => `**${id + 1}. [${song.title}](${song.url})**`);
    
            sendOk(message, `**List of songs on playlist ${playlistName}**\n${songList.join('\n')}`);
        } else {
            sendOk(message, `**List of songs on playlist ${playlistName}**\nNo songs added!`);
        }
    }

    private handleNew(message: CommandoMessage, args: string): void {
        const [ name ] = args.split(' ');
    
        if (!name) {
            sendError(message, '**Specify name of the playlist**');

            return;
        }

        PlaylistRepository.find({ name, server: message.guild.id }).exec()
            .then(ret => this.persistPlaylist(message, name, ret))
            .catch((err) => {
                sendError(message, '**Something went wrong, try again or specify a different name**');
                console.log(err);
            });

    }

    private persistPlaylist(message: CommandoMessage, name: string, playlists: Playlist[]): void {
        if (playlists.length) {
            sendError(message, '**Playlist with that name already exists**');

            return;
        }

        PlaylistRepository.create({ name, server: message.guild.id })
            .then((ret) => {
                if (!ret) {
                    sendError(message, '**Could not save the playlist, try again later**');
                } else {
                    sendOk(message, '**Saved the playlist**');
                }
            })
            .catch((err) => {
                sendError(message, '**Error while creating playlist**');
                console.log(err);
            });
    }

    private handleAdd(message: CommandoMessage, args: string): void {
        const [ playlistName, song ] = args.split(' ');
    
        if (!playlistName) {
            sendError(message, '**Specify name of the playlist**');

            return;
        }

        if (!song) {
            sendError(message, '**Specify song to add to the playlist**');

            return;
        }

        PlaylistRepository.findOne({ name: playlistName, server: message.guild.id }).exec()
            .then(ret => this.addSong(message, playlistName, song, ret))
            .catch((err) => {
                sendError(message, '**Something went wrong, try again or specify a different name**');
                console.log(err);
            });
    }

    private async addSong(message: CommandoMessage, playlistName: string, query: string, ret: Playlist): Promise<void> {
        if (!ret) {
            sendError(message, '**Playlist with that name does not exist**');

            return;
        }

        const song = await findSong(query);

        if (!song) {
            sendError(message, '**Could not add that song, add a different song**');

            return;
        }

        ret.songs.push(song);

        ret.save(err => {
            if (err) {
                sendError(message, '**Error while adding song to the playlist**');
                console.log(err);
            } else {
                sendOk(message, `**Added [${song.title}](${song.url}) to the playlist ${playlistName}**`);
            }
        });
    }

    private handleRemove(message: CommandoMessage, args: string): void {
        const [ playlistName, songID ] = args.split(' ');
    
        if (!playlistName) {
            sendError(message, '**Specify name of the playlist**');

            return;
        }
        
        if (!songID) {
            sendError(message, '**Specify ID of the song to remove**');

            return;
        }

        PlaylistRepository.findOne({ name: playlistName, server: message.guild.id }).exec()
            .then(ret => this.removeSong(message, playlistName, songID, ret))
            .catch((err) => {
                console.log(err);
                sendError(message, '**Something went wrong, try again later**');
            });
    }

    private removeSong(message: CommandoMessage, playlistName: string, songID: string, ret: Playlist): void {
        if (!ret) {
            sendError(message, '**Playlist with that name does not exist**');

            return;
        }

        const songIDParsed = parseInt(songID, 10) - 1;

        if (Number.isNaN(songIDParsed) || songIDParsed < 0 || ret.songs.length <= songIDParsed) {
            sendError(message, '**Specify a valid ID of the song to remove**');

            return;
        }

        const deleted = ret.songs.splice(songIDParsed, 1)[0];

        ret.save(err => {
            if (err) {
                sendError(message, '**Error while removing song from the playlist**');
                console.log(err);
            } else {
                sendOk(message, `**Removed [${deleted.title}](${deleted.url}) from the playlist ${playlistName}**`);
            }
        });
    }

    private handleDelete(message: CommandoMessage, args: string): void {
        const [ playlistName ] = args.split(' ');
    
        if (!config.ADMIN.some(e => e === message.author.id)) {
            sendError(message, '**You do not have access to this command**');

            return;
        }

        if (!playlistName) {
            sendError(message, '**Specify name of the playlist**');

            return;
        }

        PlaylistRepository.findOneAndDelete({ name: playlistName, server: message.guild.id }).exec()
            .then(ret => {
                if (!ret) {
                    sendError(message, '**Playlist with that name does not exist**');
                } else {
                    sendOk(message, `**Successfully deleted playlist named ${ret.name}**`);
                }
            })
            .catch((err) => {
                sendError(message, '**Something went wrong, try again later**');
                console.log(err);
            });
    }

    private handleHelp(message: CommandoMessage): void {
        const prefix = config.PREFIX;

        const embed = new MessageEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField(`\`\`\`${prefix}playlist list [PlaylistName]\`\`\``, 'Lists available playlists. If **PlaylistName** is specified, lists songs on that playlist.')
            .addField(`\`\`\`${prefix}playlist play [--shuffle] <PlaylistName>\`\`\``, 'Plays specified playlist.'
                + '\n**--shuffle** specifies whether songs on the playlist should be shuffled.')
            .addField(`\`\`\`${prefix}playlist new <Name>\`\`\``, 'Creates a new playlist named **Name**.')
            .addField(`\`\`\`${prefix}playlist add <PlaylistName> <URL | Query>\`\`\``, 'Adds a song from **URL** or **Query** to **PlaylistName**.')
            .addField(`\`\`\`${prefix}playlist remove <PlaylistName> <SongNumber>\`\`\``, 'Removes song number **SongNumber** from the **PlaylistName**.');
    
        message.channel.send(embed);
    }
}

export = PlaylistCommand;
