const commando = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Reaction = require('../../Data/Schema/reaction.js');

class ReactCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'react',
            group: 'basic',
            memberName: 'react',
            description: 'Reacts with specified reaction',
            aliases: ['r']
        });
    }

    async run(message, args){

        let arr = message.content.split(" ");
        if (arr.length === 1){
            const embed = new RichEmbed()
                .setColor('#FF0000')
                .setDescription("Specify reaction name");
            message.channel.send(embed);
        }
        else{
            Reaction.find({'name': arr[1]}, 'name url', (err, url) => {
                if (err){
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription(err.content);
                    message.channel.send(embed);
                }
                else if (url.length){
                    const embed = new RichEmbed()
                        .setColor('#00FF00')
                        .setTitle(message.member.user.tag + ' reacts with ' + url[0].name)
                        .setImage(url[0].url);
                    message.channel.send(embed);
                    message.delete(100);
                }
                else{
                    const embed = new RichEmbed()
                        .setColor('#FF0000')
                        .setDescription("Reaction does not exist");
                    message.channel.send(embed);
                }
            })
        }

    }
}

module.exports = ReactCommand;