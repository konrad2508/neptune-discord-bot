const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');

class HelpCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'core',
            memberName: 'help',
            description: 'Returns help section for the bot',
            aliases: ['h']
        });
    }

    async run(message) {
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField(`\`\`\`${PREFIX}react Name\`\`\``, 'Reacts with **Name**.')
            .addField(`\`\`\`${PREFIX}add Name URL\`\`\``, "Adds a reaction named **Name**. **URL** must lead to an image/gif.")
            .addField(`\`\`\`${PREFIX}list\`\`\``, "Lists available reactions.")
            .addField(`\`\`\`${PREFIX}join\`\`\``, "Joins your voice channel.")
            .addField(`\`\`\`${PREFIX}leave\`\`\``, "Leaves voice channel.")
            .addField(`\`\`\`${PREFIX}play <URL | Query> [--playlist]\`\`\``, "Plays song from **URL** or plays first song from YouTube based on **Query**." +
                "\n**--playlist** specifies whether to extract songs from given YouTube playlist or not.")
            .addField(`\`\`\`${PREFIX}loop\`\`\``, "Loops (or unloops) currently playing song.")
            .addField(`\`\`\`${PREFIX}playlist\`\`\``, "Manages playlists.")
            .addField(`\`\`\`${PREFIX}nowplaying\`\`\``, "Shows information about the currently playing song.")
            .addField(`\`\`\`${PREFIX}queue\`\`\``, "Shows song queue.")
            .addField(`\`\`\`${PREFIX}skip\`\`\``, "Skips currently playing song.");
        message.channel.send(embed);
    }
}

module.exports = HelpCommand;