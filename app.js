const valid = require('valid-url')

const {Client, RichEmbed} = require('discord.js')
const mongoose = require('mongoose')
const Reaction = require('./Data/Schema/reaction.js')
const express = require('express')
const https = require('https')
const YTDL = require('ytdl-core')

const app = express()

app.listen(process.env.PORT || 8080)

const client = new Client()

let servers = {}
let connections = {}

let playFunc = (message) =>{
    let server = servers[message.guild.id]
    let connection = connections[message.guild.id]
    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}))
    const embed = new RichEmbed()
        .setColor('#00FF00')
        .setDescription("Playing " + server.queue[0])
    message.channel.send(embed)
    server.queue.shift()
    server.dispatcher.on("end", () => {
        if (server.queue[0]){
            playFunc(message)
        }
        else{
            servers[message.guild.id] = undefined;
            const embed = new RichEmbed()
                .setColor('#00FF00')
                .setDescription("Queue ended")
            message.channel.send(embed)
        }
    })
}

let extractHostname = (url) => {
    let hostname;

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname;
}

let extractRootDomain = (url) => {
    let domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

mongoose.connect("mongodb://@ds139187.mlab.com:39187/reactbot-db", {
    'user': process.env.DBUSER,
    'pass': process.env.DBPASS,
    'useNewUrlParser': true,
})

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Connection open')
})

client.on('ready', () => {
    console.log('Ready!')
    client.user.setGame('::h for help')
    setInterval(() => {
        https.get('https://discord-react-bot-bodemouf.herokuapp.com/')
    }, 100000)
})

client.on('message', message => {
    if (message.content === '::help' || message.content === '::h'){
        const embed = new RichEmbed()
            .setTitle('List of commands')
            .setColor('#00FF00')
            .addField("```::react Name```", 'Reacts with **Name**.')
            .addField("```::add Name URL```", "Adds a reaction named **Name**. **URL** must lead to an image/gif.")
            .addField("```::list```", "Lists available reactions.")
        message.channel.send(embed)
    }
    else if (message.content === '::list' || message.content === '::l'){
        Reaction.find({}, 'name', (err, reactions) =>{
            if (err){
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription(err.content)
                message.channel.send(embed)
            }
            else if (reactions.length){
                let names = []
                for (let i = 0; i < reactions.length; i++){
                    names.push(reactions[i].name)
                }
                const embed = new RichEmbed()
                    .setTitle('List of commands')
                    .setColor('#00FF00')
                    .setDescription(names.sort((a,b) => { return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1}).join("\n"))
                message.channel.send(embed).then(msg => {
                    msg.delete(10000)
                })
                message.delete(100)
            }
            else{
                const embed = new RichEmbed()
                    .setTitle('List of commands')
                    .setColor('#00FF00')
                    .setDescription("No reactions added")
                message.channel.send(embed).then(msg => {
                    msg.delete(10000)
                })
                message.delete(100)
            }
        })
    }
    else if (message.content.match(/^::react($|\s.*)/) || message.content.match(/^::r($|\s.*)/)){
        let arr = message.content.split(" ")
        if (arr.length === 1){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name")
            message.channel.send(embed)
        }
        else{
            Reaction.find({'name': arr[1]}, 'name url', (err, url) => {
                if (err){
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription(err.content)
                    message.channel.send(embed)
                }
                else if (url.length){
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setTitle(message.member.user.tag + ' reacts with ' + url[0].name)
                        .setImage(url[0].url)
                    message.channel.send(embed)
                    message.delete(100)
                }
                else{
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Reaction does not exist")
                    message.channel.send(embed)
                }
            })
        }
    }
    else if (message.content.match(/^::add($|\s.*)/) || message.content.match(/^::a($|\s.*)/)){
        let arr = message.content.split(" ")
        if (arr.length === 1){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name to add")
            message.channel.send(embed)
        }
        else if (arr.length === 2){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify URL of the reaction")
            message.channel.send(embed)
        }
        else{
            if (valid.isWebUri(arr[2])){
                Reaction.find({'name': arr[1]}, 'url', (err, url) => {
                    if (err){
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription(err.content)
                        message.channel.send(embed)
                    }
                    else if (url) {
                        if (url.length) {
                            const embed = new RichEmbed()
                                .setColor('#FF0000')
                                .setDescription("Reaction with that name already exists")
                            message.channel.send(embed)
                        }
                        else {

                            Reaction.create({'name': arr[1], 'url': arr[2]}, (err, reaction) => {
                                if (err) {
                                    const embed = new RichEmbed()
                                        .setColor('#FF0000')
                                        .setDescription(err.content)
                                    message.channel.send(embed)
                                }
                                else if (reaction) {
                                    const embed = new RichEmbed()
                                        .setColor('#00FF00')
                                        .setDescription("Saved the reaction")
                                    message.channel.send(embed)
                                }
                            })
                        }
                    }
                })
            }
            else{
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Invalid URL")
                message.channel.send(embed)
            }

        }
    }
    else if (message.content.match(/^::delete($|\s.*)/) || message.content.match(/^::d($|\s.*)/)){
        if (message.author.id !== process.env.ADMIN_ID){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("You do not have access to this command")
            message.channel.send(embed)
        }
        else {
            let arr = message.content.split(" ")
            if (arr.length === 1) {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify reaction name to delete")
                message.channel.send(embed)
            }
            else if (arr.length === 2) {
                Reaction.find({'name': arr[1]}, 'url', (err, reaction) => {
                    if (err) {
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription(err.content)
                        message.channel.send(embed)
                    }
                    else if (reaction.length) {
                        Reaction.findOneAndDelete({'name': arr[1]}, (err) => {
                            if (err) {
                                const embed = new RichEmbed()
                                    .setColor('#FF0000')
                                    .setDescription(err.content)
                                message.channel.send(embed)
                            }
                            else {
                                const embed = new RichEmbed()
                                    .setColor('#00FF00')
                                    .setDescription("Reaction successfully deleted")
                                message.channel.send(embed)
                            }
                        })
                    }
                    else {
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription("Reaction does not exist")
                        message.channel.send(embed)
                    }
                })
            }
        }
    }
    else if (message.content === '::join'){
        if(message.member.voiceChannel){
            if(!message.guild.voiceConnection){
                message.member.voiceChannel.join().then( (connection) => {
                    connections[message.guild.id] = connection
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setDescription("Joined voice channel")
                    message.channel.send(embed)
                });
            }
        }
        else{
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("You must be in a voice channel")
            message.channel.send(embed)
        }
    }
    else if (message.content === '::leave'){
        if (message.guild.voiceConnection){
            message.guild.voiceConnection.disconnect()
            connections[message.guild.id] = null
            const embed = new RichEmbed()
                .setColor('#00FF00')
                .setDescription("Left voice channel")
            message.channel.send(embed)
        }
    }
    else if (message.content.match(/^::play($|\s.*)/)){
        if (message.guild.voiceConnection){
            let arr = message.content.split(" ")
            if (arr.length === 1){
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify URL of the song")
                message.channel.send(embed)
            }
            else{
                if (valid.isWebUri(arr[1]) && extractRootDomain(arr[1]) === 'youtube.com'){
                    if (servers[message.guild.id]){
                        servers[message.guild.id].queue.push(arr[1])
                        const embed = new RichEmbed()
                            .setColor('#00FF00')
                            .setDescription("Added " + arr[1] + " to the queue")
                        message.channel.send(embed)
                    }
                    else{
                        servers[message.guild.id] = {queue: []}
                        servers[message.guild.id].queue.push(arr[1])
                        playFunc(message)
                    }
                }
                else{
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Invalid URL")
                    message.channel.send(embed)
                }
            }
        }
        else{
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Bot must be in a voice channel")
            message.channel.send(embed)
        }
    }
    else if (message.content === '::skip'){
        if (message.guild.voiceConnection){
            if (servers[message.guild.id]){
                servers[message.guild.id].dispatcher.end()
                const embed = new RichEmbed()
                    .setColor('#00FF00')
                    .setDescription("Skipped currently playing song")
                message.channel.send(embed)
            }
            else{
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("No song is currently playing")
                message.channel.send(embed)
            }
        }
        else{
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Bot must be in a voice channel")
            message.channel.send(embed)
        }
    }
    else if (message.content === '::beta'){
        const embed = new RichEmbed()
            .setTitle('List of commands in testing phase')
            .setColor('#00FF00')
            .addField("```::join```", 'Joins your voice channel.')
            .addField("```::leave```", 'Leaves voice channel.')
            .addField("```::play URL```", "Queues song from YouTube to play. Audio quality may be bad, WIP.")
            .addField("```::skip```", "Skips currently playing song.")
        message.channel.send(embed)
    }
})

client.login(process.env.BOT_TOKEN)