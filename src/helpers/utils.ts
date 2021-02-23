import { MessageEmbed } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { getDomain } from 'tldjs';

export function shuffle(array: any[]): any[] {
    let currIndex = array.length;

    while (currIndex !== 0) {
        const randIndex = Math.floor(Math.random() * currIndex);
        currIndex -= 1;

        const temp = array[randIndex];
        array[randIndex] = array[currIndex];
        array[currIndex] = temp;
    }

    return array;
}

export function songTime(curr: number, max: string): string {
    console.log(curr);
    console.log(max);

    let maxHours: string, maxMinutes: string, maxSeconds: string;
    const splittedMax = max.split(':');

    if (splittedMax.length === 3) {
        [ maxHours, maxMinutes, maxSeconds ] = splittedMax;

        if (maxHours === '00' || maxHours === '0') {
            maxHours = null;
        } else if (Number(maxHours) < 10 && maxHours.length === 1) {
            maxHours = `0${maxHours}`;
        }

        if (Number(maxMinutes) < 10 && maxMinutes.length === 1) {
            maxMinutes = `0${maxMinutes}`;
        }
    } else if (splittedMax.length === 2) {
        [ maxMinutes, maxSeconds ] = splittedMax;

        if (Number(maxMinutes) < 10 && maxMinutes.length === 1) {
            maxMinutes = `0${maxMinutes}`;
        }
    } else {
        [ maxSeconds ] = splittedMax;

        maxMinutes = '00';
    }

    
    let currSeconds = Math.floor(curr / 1000);

    let currMinutes = Math.floor(currSeconds / 60);
    currSeconds %= 60;

    const currHours = Math.floor(currMinutes / 60);
    currMinutes %= 60;

    const hoursStringRepr = currHours >= 10 
        ? `${currHours}`
        : `0${currHours}`;
    
    const minutesStringRepr = currMinutes >= 10
        ? `${currMinutes}`
        : `0${currMinutes}`;
    
    const secondsStringRepr = currSeconds >= 10
        ? `${currSeconds}`
        : `0${currSeconds}`;
    
    if (maxHours) {
        return `${hoursStringRepr}:${minutesStringRepr}:${secondsStringRepr}/${maxHours}:${maxMinutes}:${maxSeconds}`;
    } else {
        return `${minutesStringRepr}:${secondsStringRepr}/${maxMinutes}:${maxSeconds}`;
    }
}

export function sendOk(message: CommandoMessage, text: string): void {
    const embed = new MessageEmbed()
        .setColor('#00FF00')
        .setDescription(text);

    message.channel.send(embed);
}

export function sendError(message: CommandoMessage, text: string): void {
    const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription(text);

    message.channel.send(embed);
}

export function extractDomain(url: string): string {
    return getDomain(url);
}
