const commando = require('discord.js-commando');
const {sendOk, sendError} = require('../../utils.js');

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
            let server = servers[message.guild.id];
            if (server) {
                if (server.nowplaying.loop){
                    server.nowplaying.loop = false;
                }
                sendOk(message, "**Skipped currently playing song**");
                server.dispatcher.end();
            }
            else {
                sendError(message, "**No song is currently playing**");
            }
        }
        else {
            sendError(message, "**Bot must be in a voice channel**");
        }

    }
}

module.exports = SkipCommand;