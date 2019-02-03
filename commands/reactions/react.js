const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');
const {sendError} = require('../../utils.js');

class ReactCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'react',
            group: 'reactions',
            memberName: 'react',
            argsPromptLimit: 0,
            description: 'Reacts with specified reaction',
            aliases: ['r'],
            args:[
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Name of the reaction',
                    default: ''
                }
            ]
        });
    }

    async run(message, {name}) {
        name = name.split(" ")[0];

        if (!name) {
            // const embed = new RichEmbed()
            //     .setColor('#FF0000')
            //     .setDescription("Specify reaction name");
            // message.channel.send(embed);
            sendError(message, "Specify reaction name");
        }
        else {
            Reaction.find({'name': name}, 'name url', (err, response) => {
                if (err) {
                    // const embed = new RichEmbed()
                    //     .setColor('#FF0000')
                    //     .setDescription(err.content);
                    // message.channel.send(embed);
                    console.log(err.content);
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
                    // const embed = new RichEmbed()
                    //     .setColor('#FF0000')
                    //     .setDescription("Reaction does not exist");
                    // message.channel.send(embed);
                    sendError(message, "Reaction does not exist");
                }
            });
        }

    }
}

module.exports = ReactCommand;