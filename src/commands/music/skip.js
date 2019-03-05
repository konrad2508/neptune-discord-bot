const commando = require('discord.js-commando');
const {sendOk, sendError} = require('../../helpers/utils.js');

class SkipCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            group: 'music',
            memberName: 'skip',
            description: 'Skips currently playing song',
            aliases: ['s'],
        });
    }

    async run(message) {
        if (!message.guild.voiceConnection) {
            sendError(message, "**Bot must be in a voice channel**");
        }
        else if (!servers[message.guild.id]) {
            sendError(message, "**No song is currently playing**");
        }
        else {
            let server = servers[message.guild.id];

            if (server.nowplaying.loop) {
                server.nowplaying.loop = false;
            }

            sendOk(message, "**Skipped currently playing song**");
            server.dispatcher.end();
        }
    }

}

module.exports = SkipCommand;