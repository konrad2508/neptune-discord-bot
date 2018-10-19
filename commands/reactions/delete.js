const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');

class DeleteCommand extends commando.Command {

    constructor(client) {
        super(client, {
            name: 'delete',
            group: 'reactions',
            memberName: 'delete',
            description: 'Deletes reaction',
            aliases: ['d'],
            args: [
                {
                    key: 'name',
                    prompt: 'Reaction name',
                    type: 'integer',
                    default: null
                }
            ]
        });
    }

    async run(message, args) {

        if (message.author.id !== process.env.ADMIN_ID) {
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("You do not have access to this command");
            message.channel.send(embed);
        }
        else {
            if (args.name) {
                const embed = new RichEmbed()
                    .setColor('#FF0000')
                    .setDescription("Specify reaction name to delete");
                message.channel.send(embed);
            }
            else {
                Reaction.find({'name': args.name}, 'url', (err, reaction) => {
                    if (err) {
                        console.log(err.content)
                    }
                    else if (reaction.length) {
                        Reaction.findOneAndDelete({'name': args.name}, (err) => {
                            if (err) {
                                console.log(err.content)
                            }
                            else {
                                const embed = new RichEmbed()
                                    .setColor('#00FF00')
                                    .setDescription("Reaction successfully deleted");
                                message.channel.send(embed);
                            }
                        });
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

}

module.exports = DeleteCommand;