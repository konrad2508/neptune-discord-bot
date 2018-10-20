const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');

class PurgeCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'music',
            memberName: 'purge',
            description: 'Purges queue',
        });
    }

    async run(message) {

        servers[message.guild.id] = undefined;
        const embed = new RichEmbed()
            .setColor('#00FF00')
            .setDescription("Queue ended");
        message.channel.send(embed);

    }
}

module.exports = PurgeCommand;