const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const YTDL = require('ytdl-core');
const YoutubeDL = require('youtube-dl');
const {sendOk, sendError} = require('utils');


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

        // const embed = new RichEmbed()
        //     .setColor('#00FF00')
        //     .setDescription("Playing **" + info.title + "**");
        // message.channel.send(embed);

        sendOk(message, "Playing **" + info.title + "**");

        server.queue.shift();

        server.dispatcher.on("end", () => {
            if (server.queue){
                if (server.queue[0]) {
                    this._playFunc(message);
                }
                else {
                    servers[message.guild.id] = undefined;
                    // const embed = new RichEmbed()
                    //     .setColor('#00FF00')
                    //     .setDescription("Queue ended");
                    // message.channel.send(embed);

                    sendOk(message, "Queue ended");
                }
            }
        });

    }

    async run(message, {url}) {
        url = url.split(" ")[0];

        if (message.guild.voiceConnection) {
            if (!url) {
                // const embed = new RichEmbed()
                //     .setColor('#FF0000')
                //     .setDescription("Specify URL of the song");
                // message.channel.send(embed);

                sendError(message, "Specify URL of the song");
            }
            else {
                YoutubeDL.getInfo(url, ['-q', '--no-warnings', '--force-ipv4', '--restrict-filenames'], null, (err, info) => {
                    if (info){
                        if (servers[message.guild.id]) {
                            servers[message.guild.id].queue.push(info);
                            // const embed = new RichEmbed()
                            //     .setColor('#00FF00')
                            //     .setDescription("Added **" + info.title + "** to the queue");
                            // message.channel.send(embed);

                            sendOk(message, "Added **" + info.title + "** to the queue");
                        }
                        else {
                            servers[message.guild.id] = {queue: []};
                            servers[message.guild.id].queue.push(info);
                            this._playFunc(message);
                        }
                    }
                    else {
                        // const embed = new RichEmbed()
                        //     .setColor('#FF0000')
                        //     .setDescription("Error while adding song to queue, try again or specify different song");
                        // message.channel.send(embed);

                        sendError(message, "Error while adding song to queue, try again or specify different song");
                    }
                });
            }
        }
        else {
            // const embed = new RichEmbed()
            //     .setColor('#FF0000')
            //     .setDescription("Bot must be in a voice channel");
            // message.channel.send(embed);

            sendError(message, "Bot must be in a voice channel");
        }

    }

}

module.exports = PlayCommand;