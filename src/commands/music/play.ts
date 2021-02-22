import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { extractDomain, sendError, sendOk } from '../../helpers/utils';
import YTDL from 'ytdl-core-discord';
import yts from 'yt-search';
import YoutubeDL from 'youtube-dl';
import util from 'util';

const playlistOptions = ['-pl', '--playlist'];
const optionRegex = /^-.*$/g;
const playlistLinkRegex = /^https?:\/\/www\.youtube\.com\/playlist.*$/g;
const videoLinkWithPlaylistRegex = /^https?:\/\/www.youtube.com\/watch\?v=.*&list=.*$/g;
const otherDomains = ['soundcloud.com'];

const getInfo = util.promisify(YoutubeDL.getInfo);

class PlayCommand extends Command {
  public constructor(client: CommandoClient) {
    const commandInfo: CommandInfo  = {
      name: 'play',
      group: 'music',
      memberName: 'play',
      argsPromptLimit: 0,
      description: 'Plays song',
      aliases: ['p'],
      args: [
        {
          key: 'opt',
          type: 'string',
          prompt: 'Option',
          default: '',
        },
        {
          key: 'url',
          type: 'string',
          prompt: 'Url of the song',
          default: '',
        },
      ]
    };

    super(client, commandInfo);
  }

  public async run(message: CommandoMessage, { opt, url }: RunArgs): Promise<any> {
    const serverId = message.guild.id;
    const server = global.servers[serverId];

    const [option, link] = this.fixArgs(opt, url);

    if (!message.guild) {
      sendError(message, 'Command unavailable through DM');

      return;
    }

    if (!server) {
      sendError(message, '**Bot must be in a voice channel**');

      return;
    }

    if (!link) {
      sendError(message, '**Specify URL of the song**');

      return;
    }

    if (option) {
      this.handleOptionCase(message, option, link);
    } else {
      this.handleOptionlessCase(message, link);
    }    
  }

  private fixArgs(arg1: string, arg2: string): string[] {
    if (arg1.match(optionRegex)) {
      return [arg1, arg2];
    } else {
      return ['', `${arg1} ${arg2}`.trim()];
    }
  }

  private handleOptionCase(message: CommandoMessage, option: string, link: string): void {
    if (!playlistOptions.some(e => e === option)) {
      sendError(message, '**Unknown option**');

      return;
    }

    if (!link.match(playlistLinkRegex) && !link.match(videoLinkWithPlaylistRegex)) {
      sendError(message, '**Specified URL does not leads to a playlist. Try adding it to the queue without --playlist option.**');

      return;
    }

    //TODO implement
    sendError(message, '**Could not add the playlist to the queue**');
  }

  private async handleOptionlessCase(message: CommandoMessage, link: string): Promise<void> {
    const serverId = message.guild.id;
    const server = global.servers[serverId];
    
    const song = await this.findSong(link);

    if (!song) {
      sendError(message, '**Could not add that song, add a different song**');

      return;
    }

    if (server.songQueue) {
      server.songQueue.push(song);
      sendOk(message, `**Added [${song.title}](${song.url}) to the queue**`);
    } else {
      server.songQueue = [song];
      this.playSong(message);
    }
  }

  private async findSong(query: string): Promise<Song> {
    const domain = extractDomain(query);
    
    if (otherDomains.some(e => e === domain)) {
      let songInfo: any = null;
      await getInfo(query)
            .then(info => songInfo = info)
            .catch((err) => {
              console.log(err);
            });
      
      if (!songInfo) {
        return null;
      }

      const song: Song = {
        url: songInfo.webpage_url,
        title: songInfo.title,
        duration: songInfo._duration_hms,
        isLooping: false,
        playlist: undefined,
      };

      console.log(song);

      return song;
    } else {
      const songResults = await yts(query);
      
      if (songResults.videos.length <= 1) {
        return null;
      }

      const foundSong = songResults.videos[0];

      const song: Song = {
        url: foundSong.url,
        title: foundSong.title,
        duration: foundSong.timestamp,
        isLooping: false,
        playlist: undefined
      };

      return song;
    }
  }

  private async playSong(message: CommandoMessage): Promise<void> {
    const serverId = message.guild.id;
    const server = global.servers[serverId];

    if (!server.nowPlaying?.isLooping) {
      server.nowPlaying = server.songQueue.shift();
    }

    const songStream = await this.getSongStream(server.nowPlaying.url);
    
    server.dispatcher = server.connection.play(songStream, { type: 'opus' });
    server.dispatcher.on('finish', () => {
      if (server.songQueue[0] || server.nowPlaying.isLooping) {
        this.playSong(message);
      } else {
        server.songQueue = undefined;
        server.nowPlaying = undefined;
        server.dispatcher = undefined;

        sendOk(message, '**Queue ended**');
      }
    });

    if (!server.nowPlaying.isLooping) {
      sendOk(message, `**Playing [${server.nowPlaying.title}](${server.nowPlaying.url})**`);
    }
  }

  private async getSongStream(url: string): Promise<any> {
    return YTDL.validateURL(url) ? await YTDL(url) : YoutubeDL(url, global.optsYoutubeDL, undefined);
  }
}

export = PlayCommand;
