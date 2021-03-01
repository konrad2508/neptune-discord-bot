import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed } from 'discord.js';
import { sendError } from '../../helpers/utils';
import { Reaction } from '../../typings/reaction';
import ReactionRepository from '../../schema/reaction';

class ReactCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
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
                    default: '',
                },
            ],
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage, { name }: ReactionRunArgs): Promise<any> {
        [ name ] = name.split(' ');

        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }
        
        if (!name) {
            sendError(message, '**Specify reaction name**');

            return;
        }

        ReactionRepository.findOne({ name, server: message.guild.id }).exec()
            .then(ret => {
                if (!ret) {
                    sendError(message, '**Reaction does not exist**');
                } else {
                    this.react(message, ret);
                }
            })
            .catch(err => {
                sendError(message, '**Something went wrong, try again or specify a different reaction**');
                console.log(err);
            });
    }

    private react(message: CommandoMessage, ret: Reaction): void {
        const embed = new MessageEmbed()
            .setColor('#00FF00')
            .setTitle(`${message.member.user.tag} reacts with ${ret.name}`)
            .setImage(ret.url);
    
        message.channel.send(embed);
        message.delete({ timeout: 100 });
    }
}

export = ReactCommand;
