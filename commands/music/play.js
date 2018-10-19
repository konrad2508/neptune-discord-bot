const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const valid = require('valid-url');
const YTDL = require('ytdl-core');

let playFunc = (message) =>{
    let server = servers[message.guild.id];
    let connection = connections[message.guild.id];
    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));
    const embed = new RichEmbed()
        .setColor('#00FF00')
        .setDescription("Playing " + server.queue[0]);
    message.channel.send(embed);
    server.queue.shift();
    server.dispatcher.on("end", () => {
        if (server.queue[0]){
            playFunc(message);
        }
        else{
            servers[message.guild.id] = undefined;
            const embed = new RichEmbed()
                .setColor('#00FF00')
                .setDescription("Queue ended");
            message.channel.send(embed);
        }
    })
};

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
    constructor(client){
        super(client, {
            name: 'play',
            group: 'music',
            memberName: 'play',
            description: 'Plays song from YouTube'
        });
    }

    async run(message, args){

        if (message.guild.voiceConnection){
            let arr = message.content.split(" ");
            if (arr.length === 1){
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify URL of the song");
                message.channel.send(embed);
            }
            else{
                if (valid.isWebUri(arr[1]) && extractRootDomain(arr[1]) === 'youtube.com' || extractRootDomain(arr[1]) === 'youtu.be){
                    if (servers[message.guild.id]){
                        servers[message.guild.id].queue.push(arr[1]);
                        const embed = new RichEmbed()
                            .setColor('#00FF00')
                            .setDescription("Added " + arr[1] + " to the queue");
                        message.channel.send(embed);
                    }
                    else{
                        servers[message.guild.id] = {queue: []};
                        servers[message.guild.id].queue.push(arr[1]);
                        playFunc(message);
                    }
                }
                else{
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Invalid URL");
                    message.channel.send(embed);
                }
            }
        }
        else{
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Bot must be in a voice channel");
            message.channel.send(embed);
        }

    }
}

module.exports = PlayCommand;