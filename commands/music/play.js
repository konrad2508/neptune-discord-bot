const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
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

    _playFunc(message) {
        let server = servers[message.guild.id];
        let connection = connections[message.guild.id];

        let info = server.queue[0];

        let video = YTDL.validateURL(info.url)
            ? YTDL(info.url, {filter: "audioonly", quality: "highestaudio"})
            : YoutubeDL(info.url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], undefined);

        server.dispatcher = connection.playStream(video);

        sendOk(message, "Playing **" + info.title + "**");

        server.queue.shift();

        server.dispatcher.on("end", () => {
            if (server.queue){
                if (server.queue[0]) {
                    this._playFunc(message);
                }
                else {
                    servers[message.guild.id] = undefined;
                    sendOk(message, "Queue ended");
                }
            }
        });

    }

    async run(message, {url}) {

        if (message.guild.voiceConnection) {
            if (!url) {
                sendError(message, "Specify URL of the song");
            }
            else {
                if (!valid.isWebUri(url)){
                    url = 'ytsearch1:' + url
                }

                YoutubeDL.getInfo(url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], null, (err, info) => {
                    if (info){
                        if (servers[message.guild.id]) {
                            servers[message.guild.id].queue.push(info);
                            sendOk(message, "Added **" + info.title + "** to the queue");
                        }
                        else {
                            servers[message.guild.id] = {queue: []};
                            servers[message.guild.id].queue.push(info);
                            this._playFunc(message);
                        }
                    }
                    else {
                        sendError(message, "Error while adding song to queue, try again or specify different song");
                    }
                });
            }
        }
        else {
            sendError(message, "Bot must be in a voice channel");
        }

    }

}

module.exports = PlayCommand;