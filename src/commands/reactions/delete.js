const commando = require('discord.js-commando');
const Reaction = require('../../schema/reaction.js');
const {sendOk, sendError} = require('../../core/utils.js');

class DeleteCommand extends commando.Command {

    constructor(client) {
        super(client, {
            name: 'delete',
            group: 'reactions',
            memberName: 'delete',
            argsPromptLimit: 0,
            description: 'Deletes reaction',
            aliases: ['d'],
            args:[
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Name of the reaction to delete',
                    default: ''
                }
            ]
        });
    }

    async run(message, {name}) {
        name = name.split(" ")[0];

        if (message.author.id !== process.env.ADMIN_ID) {
            sendError(message, "**You do not have access to this command**");
        }
        else if (!name) {
            sendError(message, "**Specify reaction name to delete**");
        }
        else {

            Reaction.find({'name': name}, 'url', (err, reaction) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, the reaction was not deleted**");
                }
                else if (!reaction.length) {
                    sendError(message, "**Reaction does not exist**");
                }
                else {
                    Reaction.findOneAndDelete({'name': name}, (err) => {
                        if (err) {
                            console.log(err.content);
                            sendError(message, "**Something went wrong, the reaction was not deleted**");
                        }
                        else {
                            sendOk(message, "**Reaction successfully deleted**");
                        }
                    });
                }
            });

        }
    }

}

module.exports = DeleteCommand;