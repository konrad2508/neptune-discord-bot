const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');
const valid = require('valid-url');

class AddCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'add',
            group: 'reactions',
            memberName: 'add',
            argsPromptLimit: 0,
            description: 'Adds reaction',
            aliases: ['a'],
            args:[
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Name of the reaction to add',
                    default: ''
                },
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the reaction to add',
                    default: ''
                }
            ]
        });
    }

    async run(message, {name, url}) {
        url = url.split(" ")[0];

        if (!name) {
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name to add");
            message.channel.send(embed);
        }
        else if (!url) {
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify URL of the reaction");
            message.channel.send(embed);
        }
        else {
            if (valid.isWebUri(url)) {
                Reaction.find({'name': name}, 'url', (err, ret_url) => {
                    if (err) {
                        console.log(err.content)
                    }
                    else if (ret_url) {
                        if (ret_url.length) {
                            const embed = new RichEmbed()
                                .setColor('#FF0000')
                                .setDescription("Reaction with that name already exists");
                            message.channel.send(embed);
                        }
                        else {
                            Reaction.create({'name': name, 'url': url}, (err, reaction) => {
                                if (err) console.log(err.content);
                                else if (reaction) {
                                    const embed = new RichEmbed()
                                        .setColor('#00FF00')
                                        .setDescription("Saved the reaction");
                                    message.channel.send(embed);
                                }
                            });
                        }
                    }
                });
            }
            else {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Invalid URL");
                message.channel.send(embed);
            }
        }
    }

}

module.exports = AddCommand;