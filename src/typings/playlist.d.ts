import { Document } from 'mongoose';

interface Playlist extends Document {
    server: string,
    name: string,
    songs: Song[]
}
