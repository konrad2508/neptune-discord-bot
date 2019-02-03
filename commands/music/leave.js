const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const {sendOk} = require('../../utils.js');

class LeaveCommand extends commando.Command {

    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'music',
            memberName: 'leave',
            description: 'Leaves voice channel'
        });
    }

    async run(message) {
        if (message.guild.voiceConnection) {
            message.guild.voiceConnection.disconnect();

            connections[message.guild.id] = null;

            if (servers[message.guild.id]){
                servers[message.guild.id].queue = null;
                servers[message.guild.id] = null;
            }

            // const embed = new RichEmbed()
            //     .setColor('#00FF00')
            //     .setDescription("Left voice channel");
            // message.channel.send(embed);

            sendOk(message, "Left voice channel");
        }

    }

}

module.exports = LeaveCommand;