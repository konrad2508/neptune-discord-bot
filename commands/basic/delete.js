const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');

class DeleteCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'delete',
            group: 'basic',
            memberName: 'delete',
            description: 'Deletes reaction',
            aliases: ['d']
        });
    }

    async run(message, args){

        if (message.author.id !== process.env.ADMIN_ID){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("You do not have access to this command");
            message.channel.send(embed);
        }
        else {
            let arr = message.content.split(" ");
            if (arr.length === 1) {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify reaction name to delete");
                message.channel.send(embed);
            }
            else if (arr.length === 2) {
                Reaction.find({'name': arr[1]}, 'url', (err, reaction) => {
                    if (err) {
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription(err.content);
                        message.channel.send(embed);
                    }
                    else if (reaction.length) {
                        Reaction.findOneAndDelete({'name': arr[1]}, (err) => {
                            if (err) {
                                const embed = new RichEmbed()
                                    .setColor('#FF0000')
                                    .setDescription(err.content);
                                message.channel.send(embed);
                            }
                            else {
                                const embed = new RichEmbed()
                                    .setColor('#00FF00')
                                    .setDescription("Reaction successfully deleted");
                                message.channel.send(embed);
                            }
                        })
                    }
                    else {
                        const embed = new RichEmbed()
                            .setColor('#FF0000')
                            .setDescription("Reaction does not exist");
                        message.channel.send(embed);
                    }
                })
            }
        }

    }
}

module.exports = DeleteCommand;