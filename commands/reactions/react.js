const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');

class ReactCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'react',
            group: 'reactions',
            memberName: 'react',
            description: 'Reacts with specified reaction',
            aliases: ['r'],
            args: [
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Reaction name',
                    default: null
                }
            ]
        });
    }

    async run(message, {name}) {

        if (name === null) {
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name");
            message.channel.send(embed);
        }
        else {
            Reaction.find({'name': name}, 'name url', (err, response) => {
                if (err) {
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription(err.content);
                    message.channel.send(embed);
                }
                else if (response.length) {
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setTitle(message.member.user.tag + ' reacts with ' + response[0].name)
                        .setImage(response[0].url);
                    message.channel.send(embed);
                    message.delete(100);
                }
                else {
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Reaction does not exist");
                    message.channel.send(embed);
                }
            });
        }

    }
}

module.exports = ReactCommand;