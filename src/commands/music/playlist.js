/* globals servers optsYoutubeDL ADMIN PREFIX */
const util = require('util');
const commando = require('discord.js-commando');
const valid = require('valid-url');
const YoutubeDL = require('youtube-dl');
const { MessageEmbed } = require('discord.js');
const Playlist = require('../../schema/playlist.js');
const PlayCommand = require('./play.js');
const { sendOk, sendError, shuffle } = require('../../helpers/utils.js');

const playOptions = ['-sh', '--shuffle'];
const optionRegex = /^-.*$/g;

const getInfo = util.promisify(YoutubeDL.getInfo);

class PlaylistCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'playlist',
      group: 'music',
      memberName: 'playlist',
      description: 'Manages everything playlist related',
      aliases: ['pl'],
      args: [
        {
          key: 'command',
          type: 'string',
          prompt: 'Type of command',
          default: '',
        },
        {
          key: 'args',
          type: 'string',
          prompt: 'Arguments of the chosen command',
          default: '',
        },
      ],
    });
  }

  async run(message, { command, args }) {
    if (!message.guild) sendError(message, 'Command unavailable through DM');
    else {
      switch (command) {
        case 'play':
        case 'p':
          handlePlay(message, args);
          break;
        case 'list':
        case 'l':
          handleList(message, args);
          break;
        case 'new':
        case 'n':
          handleNew(message, args);
          break;
        case 'add':
        case 'a':
          handleAdd(message, args);
          break;
        case 'remove':
        case 'r':
          handleRemove(message, args);
          break;
        case 'delete':
        case 'd':
          handleDelete(message, args);
          break;
        default:
          handleHelp(message);
      }
    }
  }
}

const handlePlay = (message, args) => {
  let [opt, playlistName] = args.split(' ');
  if (!opt.match(optionRegex)) {
    playlistName = playlistName
      ? `${opt} ${playlistName}`
      : opt;
    opt = '';
  }

  if (!message.member.voice.channel) sendError(message, '**Bot must be in a voice channel**');
  else if (!playlistName) sendError(message, '**Specify name of the playlist**');
  else if (opt && !playOptions.some(e => e === opt)) sendError(message, '**Unknown option**');
  else {
    Playlist.findOne({ name: playlistName, server: message.guild.id }, 'songs').exec()
      .then(ret => playFoundPlaylist(message, opt, playlistName, ret))
      .catch((err) => {
        sendError(message, '**Something went wrong, try again later**');
        console.log(err);
      });
  }
};

const playFoundPlaylist = (message, opt, playlistName, ret) => {
  if (!ret) sendError(message, '**Playlist with that name does not exist**');
  else {
    if (opt === '-sh' || opt === '--shuffle') servers[message.guild.id] = { queue: shuffle(ret.songs) };
    else servers[message.guild.id] = { queue: ret.songs };

    sendOk(message, `**Playing ${(opt === '-sh' || opt === '--shuffle') ? 'shuffled ' : ''}playlist ${playlistName}**`);
    PlayCommand.playSong(message);
  }
};

const handleList = (message, args) => {
  const [playlistName] = args.split(' ');

  if (!playlistName) {
    Playlist.find({ server: message.guild.id }, 'name').exec()
      .then(ret => listAll(message, ret))
      .catch((err) => {
        sendError(message, '**Something went wrong, try again later**');
        console.log(err);
      });
  } else {
    Playlist.findOne({ name: playlistName, server: message.guild.id }).exec()
      .then(ret => listPlaylist(message, playlistName, ret))
      .catch((err) => {
        sendError(message, '**Something went wrong, try again later**');
        console.log(err);
      });
  }
};

const listAll = (message, ret) => {
  if (ret.length) {
    const embed = new MessageEmbed()
      .setTitle('List of playlists')
      .setColor('#00FF00')
      .setDescription(ret.map(el => el.name).join('\n'));

    message.channel.send(embed);
  } else {
    const embed = new MessageEmbed()
      .setTitle('List of playlists')
      .setColor('#00FF00')
      .setDescription('No playlists added');

    message.channel.send(embed);
  }
};

const listPlaylist = (message, playlistName, ret) => {
  if (!ret) sendError(message, '**Playlist with that name does not exist**');
  else if (ret.songs.length) {
    const songList = ret.songs.map((song, id) => `**${id + 1}. [${song.title}](${song.url})**`);

    sendOk(message, `**List of songs on playlist ${playlistName}**\n${songList.join('\n')}`);
  } else sendOk(message, `**List of songs on playlist ${playlistName}**\nNo songs added!`);
};

const handleNew = (message, args) => {
  const [name] = args.split(' ');

  if (!name) sendError(message, '**Specify name of the playlist**');
  else {
    Playlist.find({ name, server: message.guild.id }).exec()
      .then(ret => persistPlaylist(message, name, ret))
      .catch((err) => {
        sendError(message, '**Something went wrong, try again or specify a different name**');
        console.log(err);
      });
  }
};

const persistPlaylist = (message, name, playlists) => {
  if (playlists.length) sendError(message, '**Playlist with that name already exists**');
  else {
    Playlist.create({ name, server: message.guild.id })
      .then((ret) => {
        if (!ret) sendError(message, '**Could not save the playlist, try again later**');
        else sendOk(message, '**Saved the playlist**');
      })
      .catch((err) => {
        sendError(message, '**Error while creating playlist**');
        console.log(err);
      });
  }
};

const handleAdd = (message, args) => {
  const [playlistName, song] = args.split(' ');

  if (!playlistName) sendError(message, '**Specify name of the playlist**');
  else if (!song) sendError(message, '**Specify song to add to the playlist**');
  else {
    Playlist.findOne({ name: playlistName, server: message.guild.id }).exec()
      .then(ret => addSong(message, playlistName, song, ret))
      .catch((err) => {
        sendError(message, '**Something went wrong, try again or specify a different name**');
        console.log(err);
      });
  }
};

const addSong = (message, playlistName, song, ret) => {
  if (!ret) sendError(message, '**Playlist with that name does not exist**');
  else {
    if (!valid.isWebUri(song)) song = `ytsearch1:${song}`;

    getInfo(song, optsYoutubeDL)
      .then(info => persistSong(message, playlistName, ret, info))
      .catch((err) => {
        sendError(message, '**Error while adding song to the playlist, try again or specify different song/playlist**');
        console.log(err);
      });
  }
};

const persistSong = (message, playlistName, ret, info) => {
  const songInfo = {
    title: info.title,
    url: info.webpage_url,
    // eslint-disable-next-line no-underscore-dangle
    duration: info._duration_hms,
    loop: false,
    video: undefined,
    playlist: playlistName,
  };

  ret.songs.push(songInfo);
  ret.save((err) => {
    if (err) {
      sendError(message, '**Error while adding song to the playlist**');
      console.log(err);
    } else sendOk(message, `**Added [${songInfo.title}](${songInfo.url}) to the playlist ${playlistName}**`);
  });
};

const handleRemove = (message, args) => {
  const [playlistName, songID] = args.split(' ');

  if (!playlistName) sendError(message, '**Specify name of the playlist**');
  else if (!songID) sendError(message, '**Specify ID of the song to remove**');
  else {
    Playlist.findOne({ name: playlistName, server: message.guild.id }).exec()
      .then(ret => removeSong(message, playlistName, songID, ret))
      .catch((err) => {
        console.log(err);
        sendError(message, '**Something went wrong, try again later**');
      });
  }
};

const removeSong = (message, playlistName, songID, ret) => {
  if (!ret) sendError(message, '**Playlist with that name does not exist**');
  else {
    songID = parseInt(songID, 10) - 1;

    if (Number.isNaN(Number(songID)) || songID < 0 || ret.songs.length <= songID) sendError(message, '**Specify a valid ID of the song to remove**');
    else {
      const deleted = ret.songs.splice(songID, 1);

      ret.save((err) => {
        if (err) {
          sendError(message, '**Error while removing song from the playlist**');
          console.log(err);
        } else sendOk(message, `**Removed [${deleted[0].title}](${deleted[0].url}) from the playlist ${playlistName}**`);
      });
    }
  }
};

const handleDelete = (message, args) => {
  const [playlistName] = args.split(' ');

  if (!ADMIN.some(e => e === message.author.id)) sendError(message, '**You do not have access to this command**');
  else if (!playlistName) sendError(message, '**Specify name of the playlist**');
  else {
    Playlist.findOneAndDelete({ name: playlistName, server: message.guild.id }).exec()
      .then((ret) => {
        if (!ret) sendError(message, '**Playlist with that name does not exist**');
        else sendOk(message, `**Successfully deleted playlist named ${ret.name}**`);
      })
      .catch((err) => {
        sendError(message, '**Something went wrong, try again later**');
        console.log(err);
      });
  }
};

const handleHelp = (message) => {
  const embed = new MessageEmbed()
    .setTitle('List of commands')
    .setColor('#00FF00')
    .addField(`\`\`\`${PREFIX}playlist list [PlaylistName]\`\`\``, 'Lists available playlists. If **PlaylistName** is specified, lists songs on that playlist.')
    .addField(`\`\`\`${PREFIX}playlist play [--shuffle] <PlaylistName>\`\`\``, 'Plays specified playlist.'
            + '\n**--shuffle** specifies whether songs on the playlist should be shuffled.')
    .addField(`\`\`\`${PREFIX}playlist new <Name>\`\`\``, 'Creates a new playlist named **Name**.')
    .addField(`\`\`\`${PREFIX}playlist add <PlaylistName> <URL | Query>\`\`\``, 'Adds a song from **URL** or **Query** to **PlaylistName**.')
    .addField(`\`\`\`${PREFIX}playlist remove <PlaylistName> <SongNumber>\`\`\``, 'Removes song number **SongNumber** from the **PlaylistName**.');

  message.channel.send(embed);
};

module.exports = PlaylistCommand;
