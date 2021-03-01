import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { sendError } from '../../helpers/utils';
import { Reaction } from '../../typings/reaction';
import ReactionRepository from '../../schema/reaction';

class ListCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: 'list',
            group: 'reactions',
            memberName: 'list',
            description: 'Returns list of reactions',
            aliases: ['l'],
        });
    }

    public async run(message: CommandoMessage): Promise<any> {
        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }

        ReactionRepository.find({ server: message.guild.id }, 'name').exec()
            .then(ret => this.listReactions(message, ret))
            .catch((err) => {
                sendError(message, '**Something went wrong, try again**');
                console.log(err.content);
            });
    }

    private listReactions(message: CommandoMessage, ret: Reaction[]): void {
        const embed = new MessageEmbed()
            .setTitle('List of reactions')
            .setColor('#00FF00');
    
        const description = ret.length
            ? ret.map(e => e.name).sort((a, b) => ((a.toLowerCase() < b.toLowerCase()) ? -1 : 1)).join('\n')
            : 'No reactions added!';
    
        embed.setDescription(description);
    
        message.channel.send(embed)
            .then(msg => msg.delete({ timeout: 15000 }));
        message.delete({ timeout: 100 });
    }
}

export = ListCommand;
