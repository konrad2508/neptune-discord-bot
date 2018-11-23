const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');

class HelpCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'reactions',
            memberName: 'help',
            description: 'Returns help for the bot',
            aliases: ['h']
        });
    }

    async run(message) {
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField("```!react Name```", 'Reacts with **Name**.')
            .addField("```!add Name URL```", "Adds a reaction named **Name**. **URL** must lead to an image/gif.")
            .addField("```!list```", "Lists available reactions.")
            .addField("```!join```", "Joins your voice channel.")
            .addField("```!leave```", "Leaves voice channel.")
            .addField("```!play URL```", "Plays song from **URL**")
            .addField("```!skip```", "Skips currently playing song.");
        message.channel.send(embed);

    }
}

module.exports = HelpCommand;