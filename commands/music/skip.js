const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');

class SkipCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            group: 'music',
            memberName: 'skip',
            description: 'Skips currently playing song'
        });
    }

    async run(message) {
        if (message.guild.voiceConnection) {
            if (servers[message.guild.id]) {
                servers[message.guild.id].dispatcher.end();
                const embed = new RichEmbed()
                    .setColor('#00FF00')
                    .setDescription("Skipped currently playing song");
                message.channel.send(embed);
            }
            else {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("No song is currently playing");
                message.channel.send(embed);
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

module.exports = SkipCommand;