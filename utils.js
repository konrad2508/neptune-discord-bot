const {RichEmbed} = require('discord.js');

function sendOk(message, text){
    const embed = new RichEmbed()
        .setColor('#00FF00')
        .setDescription(text);
    message.channel.send(embed);
}

function sendError(message, text){
    const embed = new RichEmbed()
        .setColor('#FF0000')
        .setDescription(text);
    message.channel.send(embed);
}

module.exports.sendOk = sendOk;
module.exports.sendError = sendError;