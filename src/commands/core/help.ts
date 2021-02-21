import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';

import config from '../../config';

class HelpCommand extends Command {
  public constructor(client: CommandoClient) {
    const commandInfo: CommandInfo = {
      name: 'help',
      group: 'core',
      memberName: 'help',
      description: 'Returns help section for the bot',
      aliases: ['h'],
    };

    super(client, commandInfo);
  }

  public async run(message: CommandoMessage): Promise<any> {
    const prefix = config.PREFIX;

    const embed = new MessageEmbed()
      .setTitle('List of commands')
      .setColor('#00FF00')
      .addField(`\`\`\`${prefix}react Name\`\`\``, 'Reacts with **Name**.')
      .addField(`\`\`\`${prefix}add Name URL\`\`\``, 'Adds a reaction named **Name**. **URL** must lead to an image/gif.')
      .addField(`\`\`\`${prefix}list\`\`\``, 'Lists available reactions.')
      .addField(`\`\`\`${prefix}join\`\`\``, 'Joins your voice channel.')
      .addField(`\`\`\`${prefix}leave\`\`\``, 'Leaves voice channel.')
      .addField(`\`\`\`${prefix}play [--playlist] <URL | Query>\`\`\``, 'Plays song from **URL** or plays first song from YouTube based on **Query**.'
                + '\n**--playlist** specifies whether to extract songs from given YouTube playlist or not.')
      .addField(`\`\`\`${prefix}loop\`\`\``, 'Loops (or unloops) currently playing song.')
      .addField(`\`\`\`${prefix}playlist\`\`\``, 'Manages playlists.')
      .addField(`\`\`\`${prefix}nowplaying\`\`\``, 'Shows information about the currently playing song.')
      .addField(`\`\`\`${prefix}queue\`\`\``, 'Shows song queue.')
      .addField(`\`\`\`${prefix}skip\`\`\``, 'Skips currently playing song.')
      .addField(`\`\`\`${prefix}purge\`\`\``, 'Clears the song queue.');

    await message.channel.send(embed);
  }
}

export = HelpCommand;
