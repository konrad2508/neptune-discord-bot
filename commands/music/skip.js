const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
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
            if (servers[message.guild.id]) {
                servers[message.guild.id].dispatcher.end();
                sendOk(message, "Skipped currently playing song");
            }
            else {
                sendError(message, "No song is currently playing");
            }
        }
        else {
            sendError(message, "Bot must be in a voice channel");
        }

    }
}

module.exports = SkipCommand;