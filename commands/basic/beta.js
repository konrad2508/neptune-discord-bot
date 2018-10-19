const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

class BetaCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'beta',
            group: 'basic',
            memberName: 'beta',
            description: 'Returns list of commands in beta phase'
        });
    }

    async run(message, args){

        const embed = new RichEmbed()
            .setTitle('List of commands in testing phase')
            .setColor('#00FF00')
            .addField("```::join```", 'Joins your voice channel.')
            .addField("```::leave```", 'Leaves voice channel.')
            .addField("```::play URL```", "Queues song from YouTube to play. Audio quality may be bad, WIP.")
            .addField("```::skip```", "Skips currently playing song.");
        message.channel.send(embed);

    }
}

module.exports = BetaCommand;