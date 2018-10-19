const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');
const valid = require('valid-url');

class AddCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'add',
            group: 'basic',
            memberName: 'add',
            description: 'Adds reaction',
            aliases: ['a']
        });
    }

    async run(message, args){

        let arr = message.content.split(" ");
        if (arr.length === 1){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name to add");
            message.channel.send(embed);
        }
        else if (arr.length === 2){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify URL of the reaction");
            message.channel.send(embed);
        }
        else{
            if (valid.isWebUri(arr[2])){
                Reaction.find({'name': arr[1]}, 'url', (err, url) => {
                    if (err){
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription(err.content);
                        message.channel.send(embed);
                    }
                    else if (url) {
                        if (url.length) {
                            const embed = new RichEmbed()
                                .setColor('#FF0000')
                                .setDescription("Reaction with that name already exists");
                            message.channel.send(embed);
                        }
                        else {

                            Reaction.create({'name': arr[1], 'url': arr[2]}, (err, reaction) => {
                                if (err) {
                                    const embed = new RichEmbed()
                                        .setColor('#FF0000')
                                        .setDescription(err.content);
                                    message.channel.send(embed);
                                }
                                else if (reaction) {
                                    const embed = new RichEmbed()
                                        .setColor('#00FF00')
                                        .setDescription("Saved the reaction");
                                    message.channel.send(embed);
                                }
                            })
                        }
                    }
                })
            }
            else{
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Invalid URL");
                message.channel.send(embed);
            }

        }

    }
}

module.exports = AddCommand;