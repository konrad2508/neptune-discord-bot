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
                    sendOk(message, "Joined voice channel");

                });
            }
        }
        else {
            sendError(message, "You must be in a voice channel");
        }
    }
}

module.exports = JoinCommand;