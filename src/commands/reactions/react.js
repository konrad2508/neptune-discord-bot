const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../schema/reaction.js');
const {sendError} = require('../../helpers/utils.js');

class ReactCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'react',
            group: 'reactions',
            memberName: 'react',
            argsPromptLimit: 0,
            description: 'Reacts with specified reaction',
            aliases: ['r'],
            args: [
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
            sendError(message, "**Specify reaction name**");
        }
        else {
            Reaction.findOne({'name': name}, (err, response) => {
                if (err) {
                    console.log(err.content);
                    sendError("**Something went wrong, try again or specify a different reaction**");
                }
                else if (!response) {
                    sendError(message, "**Reaction does not exist**");
                }
                else {
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setTitle(message.member.user.tag + ' reacts with ' + response.name)
                        .setImage(response.url);
                    message.channel.send(embed);
                    message.delete(100);
                }
            });
        }

    }
}

module.exports = ReactCommand;