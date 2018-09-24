const {Client, RichEmbed} = require('discord.js')
const mongoose = require('mongoose')
const Reaction = require('./Data/Schema/reaction.js')
const express = require('express')
const https = require('https')

const app = express()

app.listen(process.env.PORT || 8080)

const client = new Client()

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
            .setDescription("```::react Name``` Reacts with **Name**\n\n```::add Name URL``` Adds a reaction named **Name**\n\n```::list``` Lists available reactions")
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
                message.channel.send(embed)
            }
            else{
                const embed = new RichEmbed()
                    .setTitle('List of commands')
                    .setColor('#00FF00')
                    .setDescription("No reactions added")
                message.channel.send(embed)
            }
        })
    }
    else if (message.content.match(/^::react(^|\s).*/) || message.content.match(/^::r(^|\s).*/)){
        let arr = message.content.split(" ")
        if (arr.length === 1){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name")
            message.channel.send(embed)
        }
        else{
            Reaction.find({'name': arr[1]}, 'url', (err, url) => {
                if (err){
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription(err.content)
                    message.channel.send(embed)
                }
                else if (url.length){
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setImage(url[0].url)
                    message.channel.send(embed)
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
    else if (message.content.match(/^::add(^|\s).*/) || message.content.match(/^::a(^|\s).*/)){
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
    }
    else if (message.content.match(/^::delete(^|\s).*/) || message.content.match(/^::d(^|\s).*/)){
        if (message.author.id != 320694341494505472){
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
})

client.login(process.env.BOT_TOKEN)