const commando = require('discord.js-commando');
const mongoose = require('mongoose');
const https = require('https');
const express = require('express');

require('./config.js');

global.servers = {};
global.connections = {};

if (IS_HEROKU_APP) {
    const app = express();
    app.listen(PORT);
}

mongoose.connect(DB_URL, {
    'user': DB_USER,
    'pass': DB_PASS,
    'useNewUrlParser': true,
})
    .catch((err) => {
        console.log("database connect error:");
        console.log(err);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error:'));
db.once('open', () => {
    console.log('Connection open')
});

const client = new commando.Client({
    commandPrefix: PREFIX,
    unknownCommandResponse: false
});

client.registry.registerGroup('reactions', 'Reactions')
    .registerGroup('music', 'Music')
    .registerGroup('core', 'Core')
    .registerDefaultTypes()
    .registerCommandsIn(__dirname + "/src/commands");

client.on('ready', () => {
    console.log('Client ready');

    client.user.setActivity('!h for help')
        .catch((err) => {
            console.log("set activity error:");
            console.log(err)
        });

    if (IS_HEROKU_APP) {
        setInterval(() => {
            https.get(APP_URL)
        }, 300000);
    }
});

client.on('error', (err) => {
    console.log("client error:");
    console.log(err);
});

client.login(BOT_TOKEN)
    .catch((err) => {
        console.log("login attempt error:");
        console.log(err);
    });
