const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

class HelpCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'help',
            group: 'basic',
            memberName: 'help',
            description: 'chuj'
        });
    }

    async run(message, args){

        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField("```::react Name```", 'Reacts with **Name**.')
            .addField("```::add Name URL```", "Adds a reaction named **Name**. **URL** must lead to an image/gif.")
            .addField("```::list```", "Lists available reactions.");
        message.channel.send(embed);

    }
}

module.exports = HelpCommand;