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
    commandPrefix: global.prefix,
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

    setInterval(() => {
            https.get(process.env.APP_URL)
        }, 300000);
});

client.on('error', (err) => {
    console.log("client error:");
    console.log(err);
});

client.login(process.env.BOT_TOKEN)
    .catch((err) => {
        console.log("login attempt error:");
        console.log(err);
    });
