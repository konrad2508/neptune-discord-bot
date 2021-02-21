import { VoiceConnection } from 'discord.js';

interface ServerInfo {
  connection: VoiceConnection,
  songQueue?: Song[],
  nowPlaying?: Song,
  dispatcher?: any
}
