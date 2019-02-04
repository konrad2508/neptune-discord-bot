const {RichEmbed} = require('discord.js');

function songTime(curr, max) {
    let currSeconds = (curr / 1000).toFixed(0);
    let currMinutes = Math.floor(currSeconds / 60);
    let currHours = "00";

    let maxSeconds = max.split(":")[2];
    let maxMinutes = max.split(":")[1];
    let maxHours = max.split(":")[0];

    if (currMinutes > 59) {
        currHours = Math.floor(currMinutes / 60);
        currHours = (currHours >= 10) ? currHours : "0" + currHours;

        currMinutes = currMinutes - (currHours * 60);
    }

    currMinutes = (currMinutes >= 10) ? currMinutes : "0" + currMinutes;

    currSeconds = Math.floor(currSeconds % 60);
    currSeconds = (currSeconds >= 10) ? currSeconds : "0" + currSeconds;

    if (maxHours !== "00") {
        return currHours + ":" + currMinutes + ":" + currSeconds + "/" + maxHours + ":" + maxMinutes + ":" + maxSeconds;
    } else {
        return currMinutes + ":" + currSeconds + "/" + maxMinutes + ":" + maxSeconds;
    }
}

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
module.exports.songTime = songTime;