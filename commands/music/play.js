const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const valid = require('valid-url');
const YTDL = require('ytdl-core');

let extractHostname = (url) => {
    let hostname;

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
};

let extractRootDomain = (url) => {
    let domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
};

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
                    type: 'integer',
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

    async run(message, args) {

        if (message.guild.voiceConnection) {
            if (args.url) {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify URL of the song");
                message.channel.send(embed);
            }
            else {
                // if (valid.isWebUri(url) && extractRootDomain(url) === 'youtube.com' || extractRootDomain(url) === 'youtu.be') {
                if (YTDL.validateURL(args.url)) {
                    YTDL.getInfo(args.url, (err, info) => {
                        if (servers[message.guild.id]) {
                            servers[message.guild.id].queue.push(args.url);
                            const embed = new RichEmbed()
                                .setColor('#00FF00')
                                .setDescription("Added **" + info.title + "** to the queue");
                            message.channel.send(embed);
                        }
                        else {
                            servers[message.guild.id] = {queue: []};
                            servers[message.guild.id].queue.push(args.url);
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