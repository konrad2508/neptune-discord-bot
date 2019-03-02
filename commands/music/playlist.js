const commando = require('discord.js-commando');
const Playlist = require('../../data/schema/playlist.js');
const {RichEmbed} = require('discord.js');
const {sendOk, sendError} = require('../../utils.js');
const valid = require('valid-url');
const YTDL = require('ytdl-core');
const YoutubeDL = require('youtube-dl');

class PlaylistCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'playlist',
            group: 'music',
            memberName: 'playlist',
            description: 'Manages everything playlist related',
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

    async run(message, {command, args}) {

        if (command === 'play') {

        }
        else if (command === 'list') {
            let playlistName = args.split(' ')[0];
            if (!playlistName) {
                Playlist.find({}, 'name', (err, ret) => {
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
                Playlist.findOne({name: playlistName}, 'songs', (err, ret) => {
                    if (err) {
                        console.log(err.content);
                        sendError(message, "**Something went wrong, try again later**");
                    }
                    else if (ret.songs.length){
                        let songList = [];
                        for(let i = 0; i < ret.songs.length; i++){
                            let song = ret.songs[i];
                            songList.push(`**${i+1}. [${song.name}](${song.url})**`)
                        }
                        sendOk(message, `**List of songs on playlist ${playlistName}**\n${songList.join('\n')}`);
                    }
                    else {
                        sendOk(message, `**List of songs on playlist ${playlistName}**\nNo songs added!`);
                    }
                });
            }
        }
        else if (command === 'new') {
            let name = args.split(' ')[0];
            if (!name) {
                sendError(message, "**Specify name of the playlist**");
            }
            else {
                Playlist.find({name: name}, (err, ret) => {
                    if (err) {
                        console.log(err.content);
                        sendError(message, "**Something went wrong, try again or specify a different name**");
                    }
                    else {
                        if (ret.length) {
                            sendError(message, "**Playlist with that name already exists**");
                        }
                        else {
                            Playlist.create({name: name}, (err, playlist) => {
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
        else if (command === 'add') {
            let playlistName = args.split(' ')[0];
            let song = args.split(' ')[1];

            if (!playlistName) {
                sendError(message, "**Specify name of the playlist**");
            }
            else if (!song) {
                sendError(message, "**Specify song to add to the playlist**");
            }
            else {
                Playlist.findOne({name: playlistName}, (err, ret) => {
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
                                        name: info.title,
                                        url: info.webpage_url
                                    };

                                    ret.songs.push(songInfo);
                                    ret.save((err) => {
                                        if (!err) {
                                            sendOk(message, `**Added [${songInfo.name}](${songInfo.url}) to the playlist ${playlistName}**`);
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
        else if (command === 'delete') {

        }
        else if (command === 'remove') {
            if (message.author.id !== process.env.ADMIN_ID) {
                sendError(message, "**You do not have access to this command**");
            }
            else {

            }
        }
        else if (command === 'help') {
            const embed = new RichEmbed()
                .setTitle('List of possible commands')
                .setColor('#00FF00')
                .addField('```!playlist list [PlaylistName]```', 'Lists available playlists. If **PlaylistName** is specified, lists songs on that playlist.')
                .addField('```!playlist new <Name>```', 'Creates a new playlist named **Name**.')
                .addField('```!playlist add <PlaylistName> <URL | Query>```', 'Adds a song from **URL** or **Query** to **PlaylistName**.')
                .addField('```!playlist delete <PlaylistName> <SongNumber>```', 'Removes song number **SongNumber** from the **PlaylistName**.');
            message.channel.send(embed);
        }
        else {
            sendError(message, "**Invalid type of command**")
        }
    }
}

module.exports = PlaylistCommand;