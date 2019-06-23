const { RichEmbed } = require('discord.js');

const shuffle = (array) => {
  let currIndex = array.length;

  while (currIndex !== 0) {
    const randIndex = Math.floor(Math.random() * currIndex);
    currIndex -= 1;

    const temp = array[randIndex];
    array[randIndex] = array[currIndex];
    array[currIndex] = temp;
  }

  return array;
};

const songTime = (curr, max) => {
  let currSeconds = (curr / 1000).toFixed(0);
  let currMinutes = Math.floor(currSeconds / 60);
  let currHours = '00';

  const [maxHours, maxMinutes, maxSeconds] = max.split(':');

  if (currMinutes > 59) {
    currHours = Math.floor(currMinutes / 60);
    currHours = (currHours >= 10)
      ? currHours
      : `0${currHours}`;

    currMinutes -= (currHours * 60);
  }

  currMinutes = (currMinutes >= 10)
    ? currMinutes
    : `0${currMinutes}`;

  currSeconds = Math.floor(currSeconds % 60);
  currSeconds = (currSeconds >= 10)
    ? currSeconds
    : `0${currSeconds}`;

  return (maxHours !== '00')
    ? `${currHours}:${currMinutes}:${currSeconds}/${maxHours}:${maxMinutes}:${maxSeconds}`
    : `${currMinutes}:${currSeconds}/${maxMinutes}:${maxSeconds}`;
};

const sendOk = (message, text) => {
  const embed = new RichEmbed()
    .setColor('#00FF00')
    .setDescription(text);

  message.channel.send(embed);
};

const sendError = (message, text) => {
  const embed = new RichEmbed()
    .setColor('#FF0000')
    .setDescription(text);

  message.channel.send(embed);
};

module.exports = {
  sendOk, sendError, songTime, shuffle,
};
