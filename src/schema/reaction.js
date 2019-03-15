const mongoose = require('mongoose');

const reaction = new mongoose.Schema({
    server: {type: String, required: true},
    name: {type: String, required: true},
    url: {type: String, required: true},
});

const Reaction = mongoose.model('Reaction', reaction);

module.exports = Reaction;