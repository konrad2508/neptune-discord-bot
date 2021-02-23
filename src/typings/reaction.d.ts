import { Document } from 'mongoose';

interface Reaction extends Document {
    server: string,
    name: string,
    url: string
}
