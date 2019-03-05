const commando = require('discord.js-commando');
const {sendOk, sendError} = require('../../core/utils.js');

class LoopCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'loop',
            group: 'music',
            memberName: 'loop',
            description: 'Loops currently playing song'
        });
    }

    async run(message) {
        if (!message.guild.voiceConnection) {
            sendError(message, "**Bot must be in a voice channel**");
        }
        else {
            let server = servers[message.guild.id];

            if (server) {
                if (server.nowplaying.loop) {
                    server.nowplaying.loop = false;
                    sendOk(message, "**Unlooping currently playing song**");
                } else {
                    server.nowplaying.loop = true;
                    sendOk(message, "**Looping currently playing song**");
                }

            }
            else {
                sendError(message, "**No song is currently being played**");
            }
        }

    }
}

module.exports = LoopCommand;