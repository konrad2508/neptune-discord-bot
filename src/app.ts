import { Client, CommandoClientOptions } from 'discord.js-commando';
import mongoose from 'mongoose';
import https from 'https';
import express from 'express';
import config from './config';

// configure global variables
global.optsYoutubeDL = ['--no-warnings', '--force-ipv4', '--restrict-filenames'];
global.servers = {};

// start listening on port
if (config.IS_HEROKU_APP) {
    express().listen(config.PORT);
}

// connect to database
const connString = `mongodb+srv://${config.DB_USER}:${config.DB_PASS}${config.DB_URL}`;
mongoose.connect(connString, {
    useNewUrlParser: true
})
    .catch((err) => {
        console.log('database connect error:');
        console.log(err);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error:'));
db.once('open', () => console.log('Connection open'));

// configure discord client
const clientOptions: CommandoClientOptions = {
    commandPrefix: config.PREFIX
};
const client = new Client(clientOptions);

client.registry
    .registerGroup('reactions', 'Reactions')
    .registerGroup('music', 'Music')
    .registerGroup('core', 'Core')
    .registerDefaultTypes()
    .registerCommandsIn(`${__dirname}/commands`);

client.on('ready', () => {
    console.log('Client ready');

    client.user.setActivity(`${config.PREFIX}h for help`)
        .catch((err) => {
            console.log('set activity error:');
            console.log(err);
        });

    if (config.IS_HEROKU_APP) {
        setInterval(() => https.get(config.APP_URL), 300000);
    }
});

client.on('error', (err) => {
    console.log('client error:');
    console.log(err);
});

client.login(config.BOT_TOKEN)
    .catch((err) => {
        console.log('login attempt error:');
        console.log(err);
    });
