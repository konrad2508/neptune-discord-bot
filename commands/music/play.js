const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');
const YoutubeDL = require('youtube-dl');
const {sendOk, sendError} = require('../../utils.js');
const valid = require('valid-url');

class PlayCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            argsPromptLimit: 0,
            description: 'Plays song',
            aliases: ['p'],
            args:[
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the song',
                    default: ''
                }
            ]

        });
    }

    static _playFunc(message) {
        let server = servers[message.guild.id];
        let connection = connections[message.guild.id];

        let info = undefined;

        if (server.nowplaying && server.nowplaying.loop){
            info = server.nowplaying;
        } else {
            info = server.queue[0];

            server.queue.shift();
            server.nowplaying = info;
        }

        let video = YTDL.validateURL(info.url)
                ? YTDL(info.url, {filter: "audioonly", quality: "highestaudio"})
                : YoutubeDL(info.url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], undefined);

        server.dispatcher = connection.playStream(video);

        if (!server.nowplaying.loop) sendOk(message, `**Playing [${info.title}](${info.url})**`);

        server.dispatcher.on("end", () => {
            if (server.queue){
                if (server.queue[0] || server.nowplaying.loop) {
                    PlayCommand._playFunc(message);
                }
                else {
                    servers[message.guild.id] = undefined;
                    sendOk(message, "**Queue ended**");
                }
            }
        });

    }

    async run(message, {url}) {
        if (message.guild.voiceConnection) {
            if (!url) {
                sendError(message, "**Specify URL of the song**");
            }
            else {
                if (!valid.isWebUri(url)){
                    url = 'ytsearch1:' + url
                }

                YoutubeDL.getInfo(url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], null, (err, info) => {
                    if (info){
                        let vid =   {
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
                        }
                        else {
                            servers[message.guild.id] = {queue: []};
                            servers[message.guild.id].queue.push(vid);
                            PlayCommand._playFunc(message);
                        }
                    }
                    else {
                        sendError(message, "**Error while adding song to queue, try again or specify different song**");
                    }
                });
            }
        }
        else {
            sendError(message, "**Bot must be in a voice channel**");
        }

    }

}

module.exports = PlayCommand;