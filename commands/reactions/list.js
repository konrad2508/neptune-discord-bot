const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');

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
        Reaction.find({}, 'name', (err, reactions) => {
            if (err) {
                console.log(err.content);
            }
            else if (reactions.length) {
                let names = [];
                for (let i = 0; i < reactions.length; i++) {
                    names.push(reactions[i].name);
                }
                const embed = new RichEmbed()
                    .setTitle('List of commands')
                    .setColor('#00FF00')
                    .setDescription(names.sort((a, b) => {
                        return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1
                    }).join("\n"));
                message.channel.send(embed).then(msg => {
                    msg.delete(15000);
                });
                message.delete(100);
            }
            else {
                const embed = new RichEmbed()
                    .setTitle('List of commands')
                    .setColor('#00FF00')
                    .setDescription("No reactions added");
                message.channel.send(embed).then(msg => {
                    msg.delete(10000);
                });
                message.delete(100);
            }
        });
    }

}

module.exports = ListCommand;