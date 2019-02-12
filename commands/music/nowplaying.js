const commando = require('discord.js-commando');
const {sendError, songTime} = require('../../utils.js');
const {RichEmbed} = require('discord.js');

class NowPlayingCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'nowplaying',
            group: 'music',
            memberName: 'nowplaying',
            description: 'Prints info about currently playing song',
            aliases: ['np']
        });
    }

    async run(message) {
        if (message.guild.voiceConnection) {
            let server = servers[message.guild.id];
            if (server) {
                let time = server.dispatcher.time;
                let title = server.nowplaying.title;
                let length = server.nowplaying.duration;
                let url = server.nowplaying.url;
                let description = `Current time: \`${songTime(time, length)}\``;

                if (server.nowplaying.loop){
                    description += '\nLooped'
                }

                const embed = new RichEmbed()
                    .setTitle(`Now playing: [${title}](${url})`)
                    .setColor('#00FF00')
                    .setDescription(description);
                message.channel.send(embed);
            }
            else {
                sendError(message, "No song is currently playing");
            }
        }
        else {
            sendError(message, "Bot must be in a voice channel");
        }

    }
}

module.exports = NowPlayingCommand;