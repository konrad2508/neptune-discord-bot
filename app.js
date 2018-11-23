const commando = require('discord.js-commando');
const mongoose = require('mongoose');
const express = require('express');
const https = require('https');

const app = express();
app.listen(process.env.PORT || 8080);

global.prefix = '!';
global.servers = {};
global.connections = {};

mongoose.connect(process.env.DB_URL, {
    'user': process.env.DB_USER,
    'pass': process.env.DB_PASS,
    'useNewUrlParser': true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connection open')
});

const client = new commando.Client({
    commandPrefix: global.prefix,
    unknownCommandResponse: false
});

client.registry.registerGroup('reactions', 'Reactions')
    .registerGroup('music', 'Music')
    .registerDefaultTypes()
    .registerCommandsIn(__dirname + "/commands");

client.on('ready', () => {
    console.log('Ready');
    client.user.setActivity('!h for help');
    setInterval(() => {
        https.get(process.env.APP_URL)
    }, 180000);
});

client.on('error', console.log);

client.login(process.env.BOT_TOKEN);
