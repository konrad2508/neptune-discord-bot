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
            if (servers[message.guild.id]) {
                let time = servers[message.guild.id].dispatcher.time;
                let title = servers[message.guild.id].nowplaying.title;
                let length = servers[message.guild.id].nowplaying.duration;

                const embed = new RichEmbed()
                    .setTitle(`Now playing: ${title}`)
                    .setColor('#00FF00')
                    .setDescription(`Current time: \`\`\`${songTime(time, length)}\`\`\``);
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