import util from 'util';
import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import YTDL from 'ytdl-core';
import YoutubeDL from 'youtube-dl';
import valid from 'valid-url';
import YoutubePlaylist from 'youtube-playlist';
import { sendOk, sendError } from '../../helpers/utils.js';

const playOptions = ['-pl', '--playlist'];
const optionRegex = /^-.*$/g;
const playlistLinkRegex = /^https?:\/\/www\.youtube\.com\/playlist.*$/g;
const videoLinkWithPlaylistRegex = /^https?:\/\/www.youtube.com\/watch\?v=.*&list=.*$/g;

const getBasicInfo = util.promisify(YTDL.getBasicInfo);
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

    if (!opt.match(optionRegex)) {
      url = url
        ? `${opt} ${url}`
        : opt;
      opt = '';
    }

    if (!message.guild) {
      sendError(message, 'Command unavailable through DM');

      return;
    }
    
    if (!server) {
      sendError(message, '**Bot must be in a voice channel**');

      return;
    }

    if (!url) {
      sendError(message, '**Specify URL of the song**');

      return;
    }

    if (opt && !playOptions.some(e => e === opt)) {
      sendError(message, '**Unknown option**');

      return;
    }
    
    await this.handleUrl(message, opt, url);
  }

  private async handleUrl(message: CommandoMessage, opt: string, url: string): Promise<void> {
    if (opt === '-pl' || opt === '--playlist') {
      if (!url.match(playlistLinkRegex) && !url.match(videoLinkWithPlaylistRegex)) {
        sendError(message, '**Specified URL does not leads to a playlist. Try adding it to the queue without --playlist option.**');
      } // TODO
      else {
        await this.handlePlaylist(message, url);
      }
    } else if (url.match(playlistLinkRegex)) {
      sendError(message, '**Specified URL leads to a playlist, not a song. Use --playlist option to extract songs from a playlist.**');
    }
    else {
      this.handleSong(message, url);
    }
  }

  private async handlePlaylist(message: CommandoMessage, url: string): Promise<void> {
    let urls: any[] = [];
    await YoutubePlaylist(url, ['url', 'name'])
      .then((res: any) => urls = res.data.playlist);
  
    if (urls.length < 1) {
      sendError(message, '**Could not add the playlist to the queue**');

      return;
    }

    this.addPlaylistToQueue(message, urls);
  }

  private addPlaylistToQueue(message: CommandoMessage, urls: any): void {
    const server = global.servers[message.guild.id];
    
    const songs: Song[] = urls.map((el: any) => ({
      url: el.url,
      title: el.name,
      duration: undefined,
      isLooping: false
    } as Song));
  
    if (server.songQueue) {
      songs.forEach(vid => server.songQueue.push(vid));
    }
    else {
      server.songQueue = [];
      songs.forEach(vid => server.songQueue.push(vid));
      PlayCommand.playSong(message);
    }
  
    sendOk(message, `**Added ${urls.length} songs to the queue**`);
  }

  public static async playSong(message: CommandoMessage): Promise<void> {
    const server = global.servers[message.guild.id];

    let song: Song;
    if (server.nowPlaying?.isLooping) {
      song = server.nowPlaying;
    }
    else {
      song = this.extractInfo(message);

      if (!song.duration) {
        const newSong = await this.fetchInfo(message, song);
        if (!newSong) {
          server.songQueue = undefined;
          sendOk(message, '**Queue ended**');
          return;
        }
        song = newSong;
      }

      server.nowPlaying = song;
    }

    const songStream = YTDL.validateURL(song.url)
      ? YTDL(song.url, global.optsYTDL)
      : YoutubeDL(song.url, global.optsYoutubeDL, undefined);

    server.dispatcher = server.connection.play(songStream);
    server.dispatcher.on('finish', () => {
      if (server.songQueue[0] || server.nowPlaying.isLooping) {
        PlayCommand.playSong(message);
      } else {
        server.songQueue = undefined;
        server.nowPlaying = undefined;
        server.dispatcher = undefined;

        sendOk(message, '**Queue ended**');
      }
    });

    if (!server.nowPlaying.isLooping) {
      sendOk(message, `**Playing [${song.title}](${song.url})**`);
    }
  }

  private static extractInfo(message: CommandoMessage): Song {
    const server = global.servers[message.guild.id];
  
    const info = server.songQueue.shift();
    
    return info;
  }

  private static async fetchInfo(message: CommandoMessage, song: Song): Promise<Song> {
    const server = global.servers[message.guild.id];
  
    let keepSkipping = true;
    while (keepSkipping) {
      keepSkipping = false;
  
      await getBasicInfo(song.url, undefined) //TODO
        .then((res: any) => song.duration = new Date(res.length_seconds * 1000).toISOString().substr(11, 8))
        .catch(() => {
          sendError(message, `**Could not play [${song.title}](${song.url}), skipping.**`);
  
          if (server.songQueue?.length === 0) {
            song = undefined;
          }
          else {
            keepSkipping = true;
            song = this.extractInfo(message);
          }
        });
    }
  
    return song;
  }

  private handleSong(message: CommandoMessage, url: string): void {
    if (!valid.isWebUri(url)) {
      url = `ytsearch1:${url}`;
    }
  
    // getInfo(url, global.optsYoutubeDL)
    getInfo(url)
      .then(info => this.addSongToQueue(message, info))
      .catch((err) => {
        sendError(message, '**Error while adding song to queue, try again or specify different song**');
        console.log(err);
      });
  }

  private addSongToQueue(message: CommandoMessage, info: any): void {
    const vid: Song = {
      url: info.webpage_url,
      title: info.title,
      duration: info._duration_hms,
      isLooping: false,
      playlist: undefined,
    };
    
    const server = global.servers[message.guild.id];

    if (server.songQueue) {
      server.songQueue.push(vid);
      sendOk(message, `**Added [${vid.title}](${vid.url}) to the queue**`);
    } else {
      server.songQueue = [];
      server.songQueue.push(vid);
      PlayCommand.playSong(message);
    }
  }
}

export = PlayCommand;
