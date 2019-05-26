const commando = require('discord.js-commando');
const Playlist = require('../../schema/playlist.js');
const {RichEmbed} = require('discord.js');
const {sendOk, sendError, shuffle} = require('../../helpers/utils.js');
const valid = require('valid-url');
const YoutubeDL = require('@microlink/youtube-dl');
const PlayCommand = require('./play.js');

class PlaylistCommand extends commando.Command {
    constructor(client) {
        super(client, {
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
                    default: ''
                },
                {
                    key: 'args',
                    type: 'string',
                    prompt: 'Arguments of the chosen command',
                    default: ''
                }
            ]
        });
    }

    play(message, args) {
        if (message.guild.voiceConnection) {
            let playlistName = args.split(' ')[0];
            if (!playlistName) {
                sendError(message, "**Specify name of the playlist**");
            }
            else {
                let server = servers[message.guild.id];

                if (server) {
                    let connection = connections[message.guild.id];
                    connection.dispatcher.end();
                }

                Playlist.findOne({name: playlistName, server: message.guild.id}, 'songs', (err, ret) => {
                    if (err) {
                        console.log(err.content);
                        sendError(message, "**Something went wrong, try again later**");
                    }
                    else if (!ret) {
                        sendError(message, "**Playlist with that name does not exist**");
                    }
                    else {
                        servers[message.guild.id] = {queue: ret.songs};
                        sendOk(message, `**Playing playlist ${playlistName}**`);
                        PlayCommand.playFunc(message);
                    }
                });

            }
        }
        else {
            sendError(message, "**Bot must be in a voice channel**");
        }
    }

    playshuffle(message, args) {
        if (message.guild.voiceConnection) {
            let playlistName = args.split(' ')[0];
            if (!playlistName) {
                sendError(message, "**Specify name of the playlist**");
            }
            else {
                let server = servers[message.guild.id];
                let connection = connections[message.guild.id];

                if (server) connection.dispatcher.end();

                Playlist.findOne({name: playlistName, server: message.guild.id}, 'songs', (err, ret) => {
                    if (err) {
                        console.log(err.content);
                        sendError(message, "**Something went wrong, try again later**");
                    }
                    else if (!ret) {
                        sendError(message, "**Playlist with that name does not exist**");
                    }
                    else {
                        let playlistSongs = shuffle(ret.songs);
                        servers[message.guild.id] = {queue: playlistSongs};
                        sendOk(message, `**Playing shuffled playlist ${playlistName}**`);
                        PlayCommand.playFunc(message);
                    }
                });

            }
        }
        else {
            sendError(message, "**Bot must be in a voice channel**");
        }
    }

    list(message, args) {
        let playlistName = args.split(' ')[0];
        if (!playlistName) {
            Playlist.find({server: message.guild.id}, 'name', (err, ret) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again later**");
                }
                else if (ret.length) {
                    const embed = new RichEmbed()
                        .setTitle('List of playlists')
                        .setColor('#00FF00')
                        .setDescription(ret.map(el => el.name).join('\n'));
                    message.channel.send(embed);
                }
                else {
                    const embed = new RichEmbed()
                        .setTitle('List of playlists')
                        .setColor('#00FF00')
                        .setDescription("No playlists added");
                    message.channel.send(embed);
                }
            });
        }
        else {
            Playlist.findOne({name: playlistName, server: message.guild.id}, 'songs', (err, ret) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again later**");
                }
                else if (!ret) {
                    sendError(message, "**Playlist with that name does not exist**");
                }
                else if (ret.songs.length) {
                    let songList = [];
                    for (let i = 0; i < ret.songs.length; i++) {
                        let song = ret.songs[i];
                        songList.push(`**${i + 1}. [${song.title}](${song.url})**`)
                    }
                    sendOk(message, `**List of songs on playlist ${playlistName}**\n${songList.join('\n')}`);
                }
                else {
                    sendOk(message, `**List of songs on playlist ${playlistName}**\nNo songs added!`);
                }
            });
        }
    }

    new(message, args) {
        let name = args.split(' ')[0];
        if (!name) {
            sendError(message, "**Specify name of the playlist**");
        }
        else {
            Playlist.find({name: name, server: message.guild.id}, (err, ret) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again or specify a different name**");
                }
                else {
                    if (ret.length) {
                        sendError(message, "**Playlist with that name already exists**");
                    }
                    else {
                        Playlist.create({name: name, server: message.guild.id}, (err, playlist) => {
                            if (err) console.log(err.content);
                            else if (playlist) {
                                sendOk(message, "**Saved the playlist**");
                            }
                        });
                    }
                }
            });
        }
    }

    add(message, args) {
        let playlistName = args.split(' ')[0];
        let song = args.split(' ')[1];

        if (!playlistName) {
            sendError(message, "**Specify name of the playlist**");
        }
        else if (!song) {
            sendError(message, "**Specify song to add to the playlist**");
        }
        else {
            Playlist.findOne({name: playlistName, server: message.guild.id}, (err, ret) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again or specify a different name**");
                }
                else {
                    if (!ret) {
                        sendError(message, "**Playlist with that name does not exist**");
                    }
                    else {
                        if (!valid.isWebUri(song)) {
                            song = 'ytsearch1:' + song
                        }

                        YoutubeDL.getInfo(song, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], null, (err, info) => {
                            if (info) {

                                let songInfo = {
                                    title: info.title,
                                    url: info.webpage_url,
                                    duration: info._duration_hms,
                                    loop: false,
                                    video: undefined,
                                    playlist: playlistName
                                };

                                ret.songs.push(songInfo);
                                ret.save((err) => {
                                    if (!err) {
                                        sendOk(message, `**Added [${songInfo.title}](${songInfo.url}) to the playlist ${playlistName}**`);
                                    }
                                    else {
                                        console.log(err.content);
                                        sendError(message, "**Error while adding song to the playlist**");
                                    }
                                });

                            }
                            else {
                                sendError(message, "**Error while adding song to the playlist, try again or specify different song/playlist**");
                            }
                        });

                    }
                }
            });
        }
    }

    delete(message, args) {
        let playlistName = args.split(' ')[0];
        let songID = args.split(' ')[1];

        if (!playlistName) {
            sendError(message, "**Specify name of the playlist**");
        }
        else if (!songID) {
            sendError(message, "**Specify ID of the song to delete**");
        }
        else {
            Playlist.findOne({name: playlistName, server: message.guild.id}, (err, ret) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again later**");
                }
                else if (!ret) {
                    sendError(message, "**Playlist with that name does not exist**");
                }
                else {
                    songID = parseInt(songID) - 1;
                    if (isNaN(songID) || songID < 0 || ret.songs.length <= songID) {
                        sendError(message, "**Specify a valid ID of the song to delete**");
                    }
                    else {
                        let deleted = ret.songs.splice(songID, 1);
                        ret.save((err) => {
                            if (!err) {
                                sendOk(message, `**Removed [${deleted[0].title}](${deleted[0].url}) from the playlist ${playlistName}**`);
                            }
                            else {
                                console.log(err.content);
                                sendError(message, "**Error while deleting song from the playlist**");
                            }
                        });
                    }
                }
            });
        }
    }

    remove(message, args) {
        if (!ADMIN.some(e => e === message.author.id)) {
            sendError(message, "**You do not have access to this command**");
        }
        else {
            let playlistName = args.split(' ')[0];
            if (!playlistName) {
                sendError(message, "**Specify name of the playlist**");
            }
            else {
                Playlist.findOneAndDelete({name: playlistName, server: message.guild.id}, (err, ret) => {
                    if (err) {
                        console.log(err.content);
                        sendError(message, "**Something went wrong, try again later**");
                    }
                    else if (!ret) {
                        sendError(message, "**Playlist with that name does not exist**");
                    }
                    else {
                        sendOk(message, `**Successfully deleted playlist named ${ret.name}**`)
                    }
                });
            }
        }
    }

    help(message, args) {
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField(`\`\`\`${PREFIX}playlist list [PlaylistName]\`\`\``, 'Lists available playlists. If **PlaylistName** is specified, lists songs on that playlist.')
            .addField(`\`\`\`${PREFIX}playlist play <PlaylistName>\`\`\``, 'Plays specified playlist.')
            .addField(`\`\`\`${PREFIX}playlist playshuffle <PlaylistName>\`\`\``, 'Plays shuffled specified playlist.')
            .addField(`\`\`\`${PREFIX}playlist new <Name>\`\`\``, 'Creates a new playlist named **Name**.')
            .addField(`\`\`\`${PREFIX}playlist add <PlaylistName> <URL | Query>\`\`\``, 'Adds a song from **URL** or **Query** to **PlaylistName**.')
            .addField(`\`\`\`${PREFIX}playlist delete <PlaylistName> <SongNumber>\`\`\``, 'Removes song number **SongNumber** from the **PlaylistName**.');
        message.channel.send(embed);
    }

    async run(message, {command, args}) {
        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');
        }
        else switch (command) {
            case 'play':
            case 'p':
                this.play(message, args);
                break;
            case 'playshuffle':
            case 'ps':
                this.playshuffle(message, args);
                break;
            case 'list':
            case 'l':
                this.list(message, args);
                break;
            case 'new':
            case 'n':
                this.new(message, args);
                break;
            case 'add':
            case 'a':
                this.add(message, args);
                break;
            case 'delete':
            case 'd':
                this.delete(message, args);
                break;
            case 'remove':
            case 'r':
                this.remove(message, args);
                break;
            default:
                this.help(message, args);
        }
    }
}

module.exports = PlaylistCommand;