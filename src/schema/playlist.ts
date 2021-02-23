import mongoose, { Schema } from 'mongoose';
import { Playlist } from '../typings/playlist';

const playlist = new Schema({
    server: { type: String, required: true },
    name: { type: String, required: true },
    songs: { type: Array, default: [] },
});

export default mongoose.model<Playlist>('Playlist', playlist);
