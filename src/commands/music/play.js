/* globals servers connections optsYTDL optsYoutubeDL */
const util = require('util');
const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');
const YoutubeDL = require('@microlink/youtube-dl');
const valid = require('valid-url');
const YoutubePlaylist = require('youtube-playlist');
const { sendOk, sendError } = require('../../helpers/utils.js');

const playOptions = ['-pl', '--playlist'];
const optionRegex = /^-.*$/g;
const playlistLinkRegex = /^https?:\/\/www\.youtube\.com\/playlist.*$/g;
const videoLinkWithPlaylistRegex = /^https?:\/\/www.youtube.com\/watch\?v=.*&list=.*$/g;

const getBasicInfo = util.promisify(YTDL.getBasicInfo);
const getInfo = util.promisify(YoutubeDL.getInfo);

class PlayCommand extends commando.Command {
  constructor(client) {
    super(client, {
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
      ],
    });
  }

  static async playSong(message) {
    const server = servers[message.guild.id];
    const connection = connections[message.guild.id];

    let info;
    if (server.nowplaying && server.nowplaying.loop) info = server.nowplaying;
    else {
      info = extractInfo(message);

      if (!info.duration) {
        const newInfo = await fetchInfo(message, info);
        if (!newInfo) {
          servers[message.guild.id] = undefined;
          sendOk(message, '**Queue ended**');
          return;
        }
        info = newInfo;
      }

      server.nowplaying = info;
    }

    const song = YTDL.validateURL(info.url)
      ? YTDL(info.url, optsYTDL)
      : YoutubeDL(info.url, optsYoutubeDL, undefined);

    server.dispatcher = connection.playStream(song);
    server.dispatcher.on('end', () => {
      if (server.queue) {
        if (server.queue[0] || server.nowplaying.loop) PlayCommand.playSong(message);
        else {
          servers[message.guild.id] = undefined;
          sendOk(message, '**Queue ended**');
        }
      }
    });

    if (!server.nowplaying.loop) sendOk(message, `**Playing [${info.title}](${info.url})**`);
  }

  async run(message, { opt, url }) {
    if (!opt.match(optionRegex)) {
      url = url ? `${opt} ${url}` : opt;
      opt = '';
    }

    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else if (!message.guild.voiceConnection) sendError(message, '**Bot must be in a voice channel**');
    else if (!url) sendError(message, '**Specify URL of the song**');
    else if (opt && !playOptions.some(e => e === opt)) sendError(message, '**Unknown option**');
    else await handleUrl(message, opt, url);
  }
}

const extractInfo = (message) => {
  const server = servers[message.guild.id];

  const info = server.queue[0];
  server.queue.shift();

  return info;
};

const fetchInfo = async (message, info) => {
  const server = servers[message.guild.id];

  let keepSkipping = true;
  while (keepSkipping) {
    keepSkipping = false;

    await getBasicInfo(info.url)
      .then(res => info.duration = new Date(res.length_seconds * 1000).toISOString().substr(11, 8))
      .catch(() => {
        sendError(message, `**Could not play [${info.title}](${info.url}), skipping.**`);

        if (server.queue.length === 0) info = undefined;
        else {
          keepSkipping = true;
          info = extractInfo(message);
        }
      });
  }

  return info;
};

const handleUrl = async (message, opt, url) => {
  if (opt === '-pl' || opt === '--playlist') {
    if (!url.match(playlistLinkRegex) && !url.match(videoLinkWithPlaylistRegex)) sendError(message, '**Specified URL does not leads to a playlist. Try adding it to the queue without --playlist option.**');
    else await handlePlaylist(message, url);
  } else if (url.match(playlistLinkRegex)) sendError(message, '**Specified URL leads to a playlist, not a song. Use --playlist option to extract songs from a playlist.**');
  else handleSong(message, url);
};

const addPlaylistToQueue = (message, urls) => {
  urls = urls.map(el => ({
    url: el.url,
    title: el.name,
    duration: undefined,
    loop: false,
    video: undefined,
    playlist: undefined,
  }));

  if (servers[message.guild.id]) urls.forEach(vid => servers[message.guild.id].queue.push(vid));
  else {
    servers[message.guild.id] = { queue: [] };
    urls.forEach(vid => servers[message.guild.id].queue.push(vid));
    PlayCommand.playSong(message);
  }

  sendOk(message, `**Added ${urls.length} songs to the queue**`);
};

const handlePlaylist = async (message, url) => {
  let urls;
  await YoutubePlaylist(url, ['url', 'name']).then(res => urls = res.data.playlist);

  if (urls.length < 1) sendError(message, '**Could not add the playlist to the queue**');
  else addPlaylistToQueue(message, urls);
};

const handleSong = (message, url) => {
  if (!valid.isWebUri(url)) url = `ytsearch1:${url}`;

  getInfo(url, optsYoutubeDL)
    .then(info => addSongToQueue(message, info))
    .catch((err) => {
      sendError(message, '**Error while adding song to queue, try again or specify different song**');
      console.log(err);
    });
};

const addSongToQueue = (message, info) => {
  const vid = {
    url: info.webpage_url,
    title: info.title,
    // eslint-disable-next-line no-underscore-dangle
    duration: info._duration_hms,
    loop: false,
    video: undefined,
    playlist: undefined,
  };

  if (servers[message.guild.id]) {
    servers[message.guild.id].queue.push(vid);
    sendOk(message, `**Added [${vid.title}](${vid.url}) to the queue**`);
  } else {
    servers[message.guild.id] = { queue: [] };
    servers[message.guild.id].queue.push(vid);
    PlayCommand.playSong(message);
  }
};

module.exports = PlayCommand;
