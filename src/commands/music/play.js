const util = require('util');
const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');
const YoutubeDL = require('@microlink/youtube-dl');
const valid = require('valid-url');
const YoutubePlaylist = require('youtube-playlist');
const {sendOk, sendError} = require('../../helpers/utils.js');


const getBasicInfo = util.promisify(YTDL.getBasicInfo);
const getInfo = util.promisify(YoutubeDL.getInfo);

const extractInfo = (message) => {
    let server = servers[message.guild.id];

    let info = server.queue[0];
    server.queue.shift();

    return info
};

const options = ['-pl', '--playlist'];
const playlistLinkRegex = /^https?:\/\/www\.youtube\.com\/playlist.*$/g;
const videoLinkWithPlaylistRegex = /^https?:\/\/www.youtube.com\/watch\?v=.*&list=.*$/g;

class PlayCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            argsPromptLimit: 0,
            description: 'Plays song',
            aliases: ['p'],
            args: [
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the song',
                    default: ''
                },
                {
                    key: 'opt',
                    type: 'string',
                    prompt: 'Option',
                    default: ''
                }
            ]

        });
    }

    static async playFunc(message) {
        let server = servers[message.guild.id];
        let connection = connections[message.guild.id];

        let info = undefined;

        if (server.nowplaying && server.nowplaying.loop) {
            info = server.nowplaying;
        } else {
            info = extractInfo(message);

            if (!info.duration) {
                let keepSkipping;
                let emptyQueue = false;
                do {
                    keepSkipping = false;

                    await getBasicInfo(info.url)
                        .then(res => info.duration = new Date(res.length_seconds * 1000).toISOString().substr(11, 8))
                        .catch(err => {
                            sendError(message, `**Could not play [${info.title}](${info.url}), skipping.**`);

                            if (server.queue.length > 0) {
                                keepSkipping = true;
                                info = extractInfo(message);
                            } else {
                                emptyQueue = true;
                            }
                        })
                } while (keepSkipping);

                if (emptyQueue) {
                    servers[message.guild.id] = undefined;
                    sendOk(message, "**Queue ended**");
                    return;
                }
            }

            server.nowplaying = info;
        }

        let video = YTDL.validateURL(info.url)
            ? YTDL(info.url, {filter: "audioonly", quality: "highestaudio"})
            : YoutubeDL(info.url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], undefined);

        server.dispatcher = connection.playStream(video);

        if (!server.nowplaying.loop) sendOk(message, `**Playing [${info.title}](${info.url})**`);

        server.dispatcher.on("end", () => {
            if (server.queue) {
                if (server.queue[0] || server.nowplaying.loop) {
                    PlayCommand.playFunc(message);
                } else {
                    servers[message.guild.id] = undefined;
                    sendOk(message, "**Queue ended**");
                }
            }
        });

    }

    async run(message, {url, opt}) {
        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');
        } else if (message.guild.voiceConnection) {
            if (!url) {
                sendError(message, "**Specify URL of the song**");
            } else if (opt && !options.some(e => e === opt)) {
                sendError(message, "**Unknown option**");
            } else {
                if (opt === '-pl' || opt === '--playlist') {
                    if (!url.match(playlistLinkRegex) && !url.match(videoLinkWithPlaylistRegex)) {
                        sendError(message, "**Specified URL does not leads to a playlist. Try adding it to the queue without --playlist option.**");
                    } else {
                        let urls;
                        await YoutubePlaylist(url, ['url', 'name']).then(res => urls = res.data.playlist);

                        if (urls.length < 1) {
                            sendError(message, `**Could not add the playlist to the queue**`);
                        } else {
                            urls = urls.map(el => {
                                return {
                                    url: el.url,
                                    title: el.name,
                                    duration: undefined,
                                    loop: false,
                                    video: undefined,
                                    playlist: undefined
                                };
                            });

                            if (servers[message.guild.id]) {
                                urls.forEach(vid => servers[message.guild.id].queue.push(vid));
                            } else {
                                servers[message.guild.id] = {queue: []};
                                urls.forEach(vid => servers[message.guild.id].queue.push(vid));
                                PlayCommand.playFunc(message);
                            }
                            sendOk(message, `**Added ${urls.length} songs to the queue**`);
                        }
                    }
                } else {
                    if (url.match(playlistLinkRegex)) {
                        sendError(message, "**Specified URL leads to a playlist, not a song. Use --playlist option to extract songs from a playlist.**")
                    } else {
                        if (!valid.isWebUri(url)) {
                            url = 'ytsearch1:' + url
                        }

                        getInfo(url, ['-q', '--force-ipv4', '--restrict-filenames', '--verbose'])
                            .then(info => {
                                let vid = {
                                    url: info.webpage_url,
                                    title: info.title,
                                    duration: info._duration_hms,
                                    loop: false,
                                    video: undefined,
                                    playlist: undefined
                                };

                                if (servers[message.guild.id]) {
                                    servers[message.guild.id].queue.push(vid);
                                    sendOk(message, `**Added [${vid.title}](${vid.url}) to the queue**`);
                                } else {
                                    servers[message.guild.id] = {queue: []};
                                    servers[message.guild.id].queue.push(vid);
                                    PlayCommand.playFunc(message);
                                }
                            })
                            .catch(err => {
                                sendError(message, "**Error while adding song to queue, try again or specify different song**");
                                console.log(err);
                            });
                    }
                }
            }
        } else {
            sendError(message, "**Bot must be in a voice channel**");
        }

    }

}

module.exports = PlayCommand;