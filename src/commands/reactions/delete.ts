import { sendOk, sendError } from '../../helpers/utils';
import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import ReactionRepository from '../../schema/reaction';
import config from '../../config';

class DeleteCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'delete',
            group: 'reactions',
            memberName: 'delete',
            argsPromptLimit: 0,
            description: 'Deletes reaction',
            aliases: ['d'],
            args: [
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Name of the reaction to delete',
                    default: '',
                },
            ],
        };

        super(client, commandInfo);
    }

    public async run(message: CommandoMessage, { name }: ReactionRunArgs): Promise<any> {
        [ name ] = name.split(' ');

        if (!config.ADMIN.some(e => e === message.author.id)) {
            sendError(message, '**You do not have access to this command**');

            return;
        }
        
        if (!message.guild) {
            sendError(message, '**Command unavailable through DM**');

            return;
        }
        
        if (!name) {
            sendError(message, '**Specify reaction name to delete**');

            return;
        }

        ReactionRepository.findOneAndDelete({ name, server: message.guild.id }).exec()
            .then(ret => {
                if (ret) {
                    sendOk(message, '**Reaction successfully deleted**');
                } else {
                    sendError(message, '**Reaction does not exist**');
                }
            })
            .catch((err) => {
                sendError(message, '**Something went wrong, the reaction was not deleted**');
                console.log(err);
            });
    }
}

export = DeleteCommand;
