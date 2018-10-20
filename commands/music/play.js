const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const YTDL = require('ytdl-core');

class PlayCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            description: 'Plays song from YouTube',
            args: [
                {
                    key: 'url',
                    prompt: 'Song URL',
                    type: 'string',
                    default: null
                }
            ]
        });
    }

    _playFunc(message) {

        let server = servers[message.guild.id];
        let connection = connections[message.guild.id];

        server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

        YTDL.getInfo(server.queue[0], (err, info) => {
            const embed = new RichEmbed()
                .setColor('#00FF00')
                .setDescription("Playing **" + info.title + "**");
            message.channel.send(embed);
        });

        server.queue.shift();

        server.dispatcher.on("end", () => {
            if (server.queue[0]) {
                this._playFunc(message);
            }
            else {
                servers[message.guild.id] = undefined;
                const embed = new RichEmbed()
                    .setColor('#00FF00')
                    .setDescription("Queue ended");
                message.channel.send(embed);
            }
        });

    }

    async run(message, {url}) {

        if (message.guild.voiceConnection) {
            if (!url) {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify URL of the song");
                message.channel.send(embed);
            }
            else {
                if (YTDL.validateURL(url)) {
                    YTDL.getInfo(url, (err, info) => {
                        if (servers[message.guild.id]) {
                            servers[message.guild.id].queue.push(url);
                            const embed = new RichEmbed()
                                .setColor('#00FF00')
                                .setDescription("Added **" + info.title + "** to the queue");
                            message.channel.send(embed);
                        }
                        else {
                            servers[message.guild.id] = {queue: []};
                            servers[message.guild.id].queue.push(url);
                            this._playFunc(message);
                        }

                    });
                }
                else {
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Invalid URL");
                    message.channel.send(embed);
                }
            }
        }
        else {
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Bot must be in a voice channel");
            message.channel.send(embed);
        }

    }
}

module.exports = PlayCommand;