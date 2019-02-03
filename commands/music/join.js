const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const {sendOk, sendError} = require('../../utils.js');

class JoinCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'join',
            group: 'music',
            memberName: 'join',
            description: 'Joins voice channel'
        });
    }

    async run(message) {
        if (message.member.voiceChannel) {
            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then((connection) => {
                    connections[message.guild.id] = connection;
                    // const embed = new RichEmbed()
                    //     .setColor('#00FF00')
                    //     .setDescription("Joined voice channel");
                    // message.channel.send(embed);
                    sendOk(message, "Joined voice channel");

                });
            }
        }
        else {
            // const embed = new RichEmbed()
            //     .setColor('#FF0000')
            //     .setDescription("You must be in a voice channel");
            // message.channel.send(embed);
            sendError(message, "You must be in a voice channel");
        }
    }
}

module.exports = JoinCommand;