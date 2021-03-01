import { CommandoMessage } from 'discord.js-commando';
import { sendOk } from './utils';
import { youtubePlaylistLinkRegex, youtubeWatchLinkWithPlaylistRegex, youtubeWatchLinkRegex, youtubeWatchBaseUrl } from './strings';
import yts, { PlaylistItem, VideoMetadataResult, VideoSearchResult } from 'yt-search';
import YTDL from 'ytdl-core-discord';

export async function findSong(query: string): Promise<Song> {
    const match = query.match(youtubeWatchLinkRegex);

    let foundSong: VideoMetadataResult | VideoSearchResult;
    if (match) {
        query = match[1];

        const songResult = await yts({ videoId: query });

        if (!songResult) {
            return null;
        }

        foundSong = songResult;
    } else {
        const songResults = await yts(query);

        if (songResults.videos.length <= 1) {
            return null;
        }

        foundSong = songResults.videos[0];
    }

    const song: Song = {
        url: foundSong.url,
        title: foundSong.title,
        duration: foundSong.timestamp,
        isLooping: false,
        playlist: undefined
    };

    return song;
}

export async function findPlaylistVideos(link: string): Promise<PlaylistQueryResult> {
    const playlistId = getPlaylistId(link);

    const query = await yts({ listId: playlistId });
    const playlistVideos = query.videos;

    const songs = await getSongPlaylist(playlistVideos);
    const deletedSongs = playlistVideos.length - songs.length;

    return { songs, deletedSongs };
}

export async function playSong(message: CommandoMessage): Promise<void> {
    const serverId = message.guild.id;
    const server = global.servers[serverId];

    if (!server.nowPlaying?.isLooping) {
        server.nowPlaying = server.songQueue.shift();
    }

    const songStream = await YTDL(server.nowPlaying.url);

    server.dispatcher = server.connection.play(songStream, { type: 'opus' });

    server.dispatcher.on('finish', () => {
        if (server.songQueue?.[0] || server.nowPlaying.isLooping) {
            playSong(message);
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

function getPlaylistId(link: string): string {
    const match1 = link.match(youtubePlaylistLinkRegex);

    if (match1) {
        return match1[1];
    } else {
        const match2 = link.match(youtubeWatchLinkWithPlaylistRegex);

        return match2[1];
    }
}

async function getSongPlaylist(playlistVideos: PlaylistItem[]): Promise<Song[]> {
    const ret: Song[] = [];

    for (const video of playlistVideos) {
        if (video.title !== '[Deleted video]' && video.title !== '[Private video]') {
            const video2 = video as any; // hack to get song duration without invoking yts again

            const song: Song = {
                url: `${youtubeWatchBaseUrl}${video.videoId}`,
                title: video.title,
                duration: video2.duration.timestamp,
                isLooping: false,
                playlist: undefined
            };

            ret.push(song);
        }
    }

    return ret;
}
