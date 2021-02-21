import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils.js';

class SkipCommand extends Command {
  public constructor(client: CommandoClient) {
    const commandInfo: CommandInfo = {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skips currently playing song',
      aliases: ['s'],
    };

    super(client, commandInfo);
  }

  public async run(message: CommandoMessage): Promise<any> {
    const serverId = message.guild.id;
    const server = global.servers[serverId];

    if (!message.guild) {
      sendError(message, 'Command unavailable through DM');

      return;
    }

    if (!server) {
      sendError(message, '**Bot must be in a voice channel**');

      return;
    }
    
    if (!server.nowPlaying) {
      sendError(message, '**No song is currently playing**');

      return;
    }

    server.nowPlaying.isLooping = false;

    server.dispatcher.end();

    sendOk(message, '**Skipped currently playing song**');
  }
}

export = SkipCommand;
