import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { sendOk, sendError } from '../../helpers/utils.js';

class PurgeCommand extends Command {
  public constructor(client: CommandoClient) {
    const commandInfo: CommandInfo = {
      name: 'purge',
      group: 'music',
      memberName: 'purge',
      description: 'Clears the song queue'
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

    server.songQueue = undefined;
    server.nowPlaying.isLooping = false;

    server.dispatcher.end();

    sendOk(message, '**Cleared the queue**');
  }
}

export = PurgeCommand;
