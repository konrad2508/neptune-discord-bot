/* globals ADMIN */
const commando = require('discord.js-commando');
const Reaction = require('../../schema/reaction.js');
const { sendOk, sendError } = require('../../helpers/utils.js');

class DeleteCommand extends commando.Command {
    constructor(client) {
        super(client, {
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
        });
    }

    async run(message, { name }) {
        [name] = name.split(' ');

        if (!ADMIN.some(e => e === message.author.id)) sendError(message, '**You do not have access to this command**');
        else if (!message.guild) sendError(message, 'Command unavailable through DM');
        else if (!name) sendError(message, '**Specify reaction name to delete**');
        else {
            Reaction.findOneAndDelete({ name, server: message.guild.id }).exec()
                .then((ret) => {
                    if (ret) sendOk(message, '**Reaction successfully deleted**');
                    else sendError(message, '**Reaction does not exist**');
                })
                .catch((err) => {
                    sendError(message, '**Something went wrong, the reaction was not deleted**');
                    console.log(err);
                });
        }
    }
}

module.exports = DeleteCommand;
