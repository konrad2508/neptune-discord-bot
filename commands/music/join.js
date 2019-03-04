const commando = require('discord.js-commando');
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
        if (!message.member.voiceChannel) {
            sendError(message, "**You must be in a voice channel**");
        }
        else if (message.guild.voiceConnection) {
            sendError(message, "**Bot is already in the voice channel**");
        }
        else {
            connections[message.guild.id] = await message.member.voiceChannel.join();
            sendOk(message, "**Joined voice channel**");
        }
    }
}

module.exports = JoinCommand;