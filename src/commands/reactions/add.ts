import { sendOk, sendError } from '../../helpers/utils.js';
import { Command, CommandInfo, CommandoClient, CommandoMessage } from 'discord.js-commando';
import valid from 'valid-url';
import ReactionRepository from '../../schema/reaction';

class AddCommand extends Command {
    public constructor(client: CommandoClient) {
        const commandInfo: CommandInfo = {
            name: 'add',
            group: 'reactions',
            memberName: 'add',
            argsPromptLimit: 0,
            description: 'Adds reaction',
            aliases: ['a'],
            args: [
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Name of the reaction to add',
                    default: '',
                },
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the reaction to add',
                    default: '',
                },
            ],
        };
        
        super(client, commandInfo);
    }

    public async run(message: CommandoMessage, { name, url }: ReactionRunArgs): Promise<any> {
        [ url ] = url.split(' ');

        if (!message.guild) {
            sendError(message, 'Command unavailable through DM');

            return;
        }

        if (!name) {
            sendError(message, '**Specify reaction name to add**');

            return;
        }
        
        if (!url) {
            sendError(message, '**Specify URL of the reaction**');

            return;
        }

        if (!valid.isWebUri(url)) {
            sendError(message, '**Invalid URL**');

            return;
        }

        ReactionRepository.find({ name, server: message.guild.id }).exec()
            .then(ret => {
                if (ret.length) {
                    sendError(message, '**Reaction with that name already exists**');
                } else {
                    this.persistReaction(message, name, url);
                }
            })
            .catch(err => {
                sendError(message, '**Something went wrong, try again or specify a different reaction**');
                console.log(err);
            });
    }

    private persistReaction(message: CommandoMessage, name: string, url: string): void {
        ReactionRepository.create({ name, url, server: message.guild.id })
            .then(() => sendOk(message, '**Saved the reaction**'))
            .catch((err) => {
                sendError(message, '**Something went wrong, try again or specify a different reaction**');
                console.log(err);
            });
    }
}

export = AddCommand;
