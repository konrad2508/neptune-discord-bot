const commando = require('discord.js-commando');
const Reaction = require('../../schema/reaction.js');
const valid = require('valid-url');
const {sendOk, sendError} = require('../../core/utils.js');

class AddCommand extends commando.Command {
    constructor(client) {
        super(client, {
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
                    default: ''
                },
                {
                    key: 'url',
                    type: 'string',
                    prompt: 'Url of the reaction to add',
                    default: ''
                }
            ]
        });
    }

    async run(message, {name, url}) {
        url = url.split(" ")[0];

        if (!name) {
            sendError(message, "**Specify reaction name to add**");
        }
        else if (!url) {
            sendError(message, "**Specify URL of the reaction**");
        }
        else if (!valid.isWebUri(url)) {
            sendError(message, "**Invalid URL**");
        }
        else {

            Reaction.find({'name': name}, 'url', (err, ret_url) => {
                if (err) {
                    console.log(err.content);
                    sendError(message, "**Something went wrong, try again or specify a different reaction**")
                }
                else if (ret_url.length) {
                    sendError(message, "**Reaction with that name already exists**");
                }
                else {
                    Reaction.create({'name': name, 'url': url}, (err) => {
                        if (err){
                            console.log(err.content);
                            sendError(message, "**Something went wrong, try again or specify a different reaction**");
                        }
                        else {
                            sendOk(message, "**Saved the reaction**");
                        }
                    });
                }
            });

        }
    }

}

module.exports = AddCommand;