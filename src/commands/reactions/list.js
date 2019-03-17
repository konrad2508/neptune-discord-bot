const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../schema/reaction.js');
const {sendError} = require('../../helpers/utils.js');

class ListCommand extends commando.Command {

    constructor(client) {
        super(client, {
            name: 'list',
            group: 'reactions',
            memberName: 'list',
            description: 'Returns list of reactions',
            aliases: ['l']
        });
    }

    async run(message) {
        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');
        }
        else {
            Reaction.find({'server': message.guild.id}, 'name', (err, reactions) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again**");
                }
                else if (!reactions.length) {
                    const embed = new RichEmbed()
                        .setTitle('List of reactions')
                        .setColor('#00FF00')
                        .setDescription("No reactions added!");
                    message.channel.send(embed).then(msg => {
                        msg.delete(10000);
                    });
                    message.delete(100);
                }
                else {
                    let names = reactions.map(e => e.name);
                    const embed = new RichEmbed()
                        .setTitle('List of reactions')
                        .setColor('#00FF00')
                        .setDescription(names.sort((a, b) => {
                            return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1
                        }).join("\n"));
                    message.channel.send(embed).then(msg => {
                        msg.delete(15000);
                    });
                    message.delete(100);
                }
            });
        }
    }
}

module.exports = ListCommand;