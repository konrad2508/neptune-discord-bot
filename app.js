const valid = require('valid-url');

const { RichEmbed } = require('discord.js');
const commando = require('discord.js-commando');
const mongoose = require('mongoose');
const Reaction = require('./Data/Schema/reaction.js');
const express = require('express');
const https = require('https');
const YTDL = require('ytdl-core');

const app = express();

app.listen(process.env.PORT || 8080);

mongoose.connect("mongodb://@ds139187.mlab.com:39187/reactbot-db", {
    'user': process.env.DBUSER,
    'pass': process.env.DBPASS,
    'useNewUrlParser': true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connection open')
});

const client = new commando.Client({
    commandPrefix: '?',
    unknownCommandResponse: false
});

global.servers = {};
global.connections = {};

client.registry
    .registerGroup('basic', 'Basic')
    .registerGroup('music', 'Music')
    .registerCommandsIn(__dirname + "/commands");

client.on('ready', () => {
    console.log('Ready!');
    client.user.setGame('?h for help');
    setInterval(() => {
        https.get('https://discord-react-bot-bodemouf.herokuapp.com/')
    }, 100000);
});

client.login(process.env.BOT_TOKEN);
