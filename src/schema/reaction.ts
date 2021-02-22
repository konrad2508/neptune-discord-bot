import { Reaction } from '../typings/reaction';
import mongoose, { Schema } from 'mongoose';

const reaction = new Schema({
    server: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
});

export default mongoose.model<Reaction>('Reaction', reaction);
