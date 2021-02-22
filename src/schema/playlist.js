const mongoose = require('mongoose');

const playlist = new mongoose.Schema({
    server: { type: String, required: true },
    name: { type: String, required: true },
    songs: { type: Array, default: [] },
});

const Playlist = mongoose.model('Playlist', playlist);

module.exports = Playlist;
