const { Client, PermissionsBitField, EmbedBuilder, AttachmentBuilder, ChannelType, Partials } = require('discord.js');

const https = require('https');
const fs = require('fs');
const bluesSearchEngine = require('./bluesSearchEngine.js');
const token = 'MTE3NjQ5MzY2MDEwNDI5ODUxNg.GpvlCa.GlK8QEmnB_DJcd8nFSJFWx6UNF-FVFXSaQrmMI';
const guildId = '1176493157165310003';

const client = new Client(
    {
        intents: [
            1,
            512,
            32768,
            4,
            64,
            4096,
            8,
            2,
            128,
            8192,
            16384,
        ]
    }
);

console.log('Discord Bot is starting.');

class commandBuilder {
    constructor() { this.commands = []; }
    create(info, callback) {
        const command = {
            name: info.name.split(' ')[0],
            description: info.description || '',
            callback
        };
        this.commands.push(command);
    }
    //getAllCommands(staff = false) { return this.commands; }
};

const commandBuild = new commandBuilder();

client.once('ready', () => console.log('Discord Bot is running.'));

////////////////Logging System////////////////

function newEmbed(type, data) {
    let mb = new EmbedBuilder();
    let additionMessage = [];
    try {
        switch (type) {
            case 'messageDelete': // data = message;
                mb.setDescription(`A message by ${data.author} is deleted in ${data.channel}`)
                    .setColor('Red')
                    .setTitle('Message Deleted')
                    .setAuthor({ name: data.author.username, iconURL: data.author.avatarURL() })
                    .addFields(data.content ? { name: 'Content:', value: data.content } : { name: 'Content:', value: 'Attachment:' })
                    .setTimestamp();
                console.log(data.attachments.size)
                if (data.attachments.size > 0) {
                    data.attachments.forEach(attachment => {
                        console.log(`Link: ${attachment.url}`);
                        additionMessage.push(attachment.url);
                    });
                } else console.log("No attachment");
                break;
            case 'messageUpdate': // data = [oldMessage, newMessage];
                let oldMessage = data[0]
                mb.setDescription(`${oldMessage.author} edits a message in ${oldMessage.channel}`)
                    .setColor('Yellow')
                    .setTitle('Message Edited')
                    .setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.avatarURL() })
                    .addFields({ name: 'Before:', value: oldMessage.content }, { name: 'After:', value: data[1].content },).setTimestamp()
                break;
            case 'guildMemberAdd': // data = member;
                mb.setDescription(`Total members: ${client.guilds.cache.get('1125667083544436758').memberCount}`)
                    .setTitle(`${data.user.tag} has joined BlockState!`)
                    .setColor('Green')
                    .setThumbnail(data.user.avatarURL())
                    .setTimestamp()
                break;
            case 'guildMemberRemove': // data = member;
                mb.setDescription(`Total members: ${client.guilds.cache.get('1125667083544436758').memberCount}`)
                    .setTitle(`${data.user.tag} has left BlockState!`)
                    .setColor('DarkOrange')
                    .setThumbnail(data.user.avatarURL())
                    .setTimestamp()
                break;
            case 'inviteCreate': // data = invite;
                mb.setDescription(`The invitation is for ${data.channel.name}`)
                    .setTitle(`${data.inviter.tag} has created a new invitation!`)
                    .setColor('Gold')
                    .setThumbnail(data.inviter.avatarURL())
                    .setTimestamp()
                break;
            case 'guildBanAdd': // data = member;
                mb.setDescription(`${data.user.tag} is BANNED!`)
                    .setColor('Orange')
                    .setThumbnail(data.user.avatarURL())
                    .setTimestamp()
                break;
            case 'guildBanRemove': // data = member;
                mb.setDescription(`${data.user.tag} is UNBANNED!`)
                    .setColor('Orange')
                    .setThumbnail(data.user.avatarURL())
                    .setTimestamp()
                break;
        }
        if (additionMessage.length > 0) {
            let file = additionMessage.map((url) => new AttachmentBuilder(url));
            client.channels.cache.get('1133095629388775544').send({ embeds: [mb], files: file }); // '1133095629388775544' = Log channel 
        } else client.channels.cache.get('1133095629388775544').send({ embeds: [mb] });
    } catch (error) { console.log(error) }
};

client.on('guildBanRemove', (ban) => { newEmbed("guildBanRemove", ban); });

client.on('guildBanAdd', (ban) => { newEmbed("guildBanAdd", ban); });

client.on('inviteCreate', (invite) => {
    if (invite.channel.topic === 'private-meeting-room-created-by-blockstate-bot' || invite.inviter.tag === 'BlockState Bot#4232') console.log('Private Meeting invitation created or Bot created an invitation');
    else {
        console.log("Invitation created");
        newEmbed("inviteCreate", invite);
    };
});

client.on("guildMemberRemove", (member) => {
    console.log("member left");
    newEmbed("guildMemberRemove", member);
});

client.on("messageUpdate", (oldMessage, newMessage) => { if (oldMessage.author !== client.user && oldMessage.content !== newMessage.content) newEmbed("messageUpdate", [oldMessage, newMessage]); });

client.on("guildMemberAdd", (member) => {
    console.log("New user joined");
    newEmbed("guildMemberAdd", member);
    if (member.id === '682599792462921744') { //682599792462921744 = the.hyacinth
        let blockstateDiscord = client.guilds.cache.get('1125667083544436758');
        let generalChannel = blockstateDiscord.channels.cache.get('1125667085041811508');
        generalChannel.send('<@682599792462921744> is here! Everyone, say hi to it!');
        generalChannel.send(
            {
                files: [
                    {
                        attachment: `./hya/${Math.floor(Math.random() * 16 + 1)}.png`,
                        name: 'hya.png'
                    }
                ]
            }
        );
    } else {
        setTimeout(async () => {
            const user = await client.users.fetch(member.id);
            if (user) {
                user.send(`Welcome to BlockState, ${member.user.tag}! We'd love to have you here and hope you enjoy your stay! 🎉`);
            } else { message.reply('User not found'); }
        }, 10000);
    }
});

client.on("messageDelete", (message) => {
    if (message.channel.id === '1133095629388775544' || message.author.bot || message.content.startsWith('blockstate.')) return; // '1133095629388775544' = Log channel
    console.log(message.content);
    newEmbed("messageDelete", message);
});

client.on('messageCreate', (message) => {
    const content = message.content;
    if (!content.startsWith('blockstate.' || message.author.bot) || message.channel.type === 'DM') return;
    const args = content.slice(11).split(/\s+/g);
    const cmd = args.shift();
    const command = commandBuild.commands.find((cmdName) => cmdName.name === cmd);
    if (!command) return;// message.reply(`Command not found!`);
    //if (message.member.permissions.has([PermissionsBitField.Flags.KickMembers]) && !message.member.roles.cache.some(role => role.id === '1133085135374393464')) return;
    command.callback(message, args);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type === 'DM') return;
    if (message.author.id === '424820587551129600' && message.guild === null) {
        let guild = client.guilds.cache.get('1125667083544436758');
        let channel = guild.channels.cache.get('1125667085041811508'); // '1125667085041811508' = general channel
        let command = message.content;
        if (command.startsWith('blockstate.')) {
            const [, commandAndArgs] = command.split('.'); // Split by '.'
            const [commandName, ...args] = commandAndArgs.split(/\s+/);
            switch (commandName) {
                case 'say':
                    channel.send(args.join(' '));
                    break;
                case 'reply':
                    console.log(args)
                    channel.messages.fetch(args[0]).then((referredMessage) => { referredMessage.reply(args.slice(1).join(' ')); });
                    break;
                case 'shut':
                    channel.send({ stickers: guild.stickers.cache.filter(sticker => sticker.name === "shut") });
                    break;
                case 'dm':
                    try {
                        client.users.send(args[0], args.slice(1).join(' '));
                    } catch (error) { console.error('Error fetching user:', error); };
                    break;
                default:
                    message.reply('No prefix matched');
                    break;
            }
        } else { message.reply('No prefix detected (blockstate.say | blockstate.reply [messageID to reply] | blockstate.shut)') };
    } else if (message.guild === null) {
        client.users.send('424820587551129600', `$$ ${message.author.tag}:: ${message.content}`);
    }
    const ignoreRoles = [
        '1133085135374393464', // Owner 1133085135374393464
        '1133085292023250965', // Moderator 1133085292023250965 
        '1165285174108504174' // Community Manager 1165285174108504174
    ];

    const ignoreChannels = [
        '1125670051442344077', // Mod private 1125670051442344077
        '1133095629388775544', // Log 1133095629388775544
        '1165285572428963920' // Community Related 1165285572428963920
    ];

    const wordList = require('./bad-word.js');
    try {
        for (const ignoreRole of ignoreRoles) { if (message.member?.roles?.cache?.has(ignoreRole)) return; }
        for (const ignoreChannel of ignoreChannels) { if (message.channel.id === ignoreChannel) return; }
        for (const word of wordList) {
            if (word.test(message.content.toLowerCase())) {
                console.log(`Sensitive word detected: ${word}`);
                client.channels.cache.get(ignoreChannels[0]).send(`${message.author} used a sensitive word in their message: ${message.content.toString()}\nLink to message: ${message.url}`);
                return;
            }
        }
    } catch (error) { console.log(error) }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        if (oldState.channelId && !newState.channelId) {
            let leaveChannel = oldState.channel;
            const fetchedLeaveChannel = await client.channels.fetch(leaveChannel.id);
            if (fetchedLeaveChannel && fetchedLeaveChannel.name === 'private-meeting-room' && fetchedLeaveChannel.members.size === 0) {
                console.log(`There's no member in VC! Deleting meeting room. memberCount: ${fetchedLeaveChannel.memberCount}`);
                fetchedLeaveChannel.delete();
            };
        }
    } catch (error) { console.log(error) }
});

commandBuild.create(
    {
        name: 'help',
        description: 'Told people to move to Help channel',

    }, (message) => {
        message.delete();
        let original = message.reference;
        if (original) { client.guilds.cache.get(guildId)?.channels.cache.get(original.channelId)?.messages.fetch(original.messageId).then((referredMessage) => { referredMessage.reply(`Please move to https://discord.com/channels/1125667083544436758/1138844177006854274 for help!`) }) };
    }
);

commandBuild.create(
    {
        name: 'rule',
        description: 'Rule List',

    }, (message, args) => {
        const rulesArray = [
            "## In addition to the [Discord Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines), we have our own rules to keep this server clean and tidy!",
            "# Server Rules",
            "- 1. Be friendly, respect each other, and use common sense. You can use some curse words here and there, but not too much. Also, slurs are NOT curse words; using them will result in a ban. (TLDR: Do not spread hate in any form)",
            "- 2. Try to avoid NSFW, religion, culture, and politics here!",
            "- 3. Don't spam or post random, unrelated, inappropriate content, or chain messages. Move to the dedicated channel for the topic that you want to talk about. If there isn't one, then you can use the general channel.",
            "- 4. Don't advertise! This also applies to DMs of other members!",
            "- 5. Don't post the same message in multiple channels (cross-posting).",
            "- 6. Speak English only. We respect your language, but for the purpose of understanding each other, English is the only universal language that fits the criteria.",
            "- 7. No excessive swearing. A little bit is fine, but too much will become a problem!",
            "- 8. Don't ask for roles.",
            "- 9. Don't ping or direct message moderators or anyone else for help! We will help you eventually; please be patient!",
            "- 10. Keep the discussion on the topic of the channel.",
            "- 11. Be funny... or else....",
        ];

        let original = message.reference;
        if (args && args.length > 0) {
            message.delete();
            let ruleIndex = parseInt(args[0], 10);
            if (typeof ruleIndex !== "number" || ruleIndex + 2 > rulesArray.length || ruleIndex < 1) return;
            if (original && message.member.permissions.has([PermissionsBitField.Flags.KickMembers])) {
                client.guilds.cache.get(guildId)?.channels.cache.get(original.channelId)?.messages.fetch(original.messageId).then((referredMessage) => { referredMessage.reply(`# Please abide by rule ${ruleIndex}: # \n ${rulesArray[ruleIndex + 1]}`); })
            } else { message.channel.send(` # Rule ${ruleIndex}: # \n ${rulesArray[ruleIndex + 1]}`); };
        } else if (message.author.id === '424820587551129600') {
            message.delete();
            message.channel.send(rulesArray.join('\n\n'));
        } else {
            message.reply({ content: 'You do not have the required permission to execute this action', ephemeral: true }).then((replied) => {
                setTimeout(() => {
                    replied.delete();
                    message.delete();
                }, 5000);
            })
        }
    }
);

commandBuild.create(
    {
        name: 'warn',
        description: 'Warn User',

    }, (message, args) => {
        if (!message.member.permissions.has([PermissionsBitField.Flags.KickMembers])) return;
        let original = message.reference;
        if (!original) message.reply({ content: 'You need to reply to a warning message from the Bot to warn!', ephemeral: true });
        else {
            let channel = client.channels.cache.get(original.channelId);
            if (channel) {
                channel.messages.fetch(original.messageId).then((fetchedMessage) => {
                    const match = fetchedMessage.cleanContent.match(/https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
                    if (match) {
                        const [_, guildId, channelId, messageId] = match;
                        client.guilds.cache.get(guildId)?.channels.cache.get(channelId)?.messages.fetch(messageId).then((referredMessage) => { referredMessage.reply(args.length > 0 ? args.join(' ') : "You've been warned for the use of profanity") }).catch((error) => console.error('Error fetching the message:', error));
                    } else console.error('No message link found in the message.');
                }).catch((error) => { console.error('Error fetching the message:', error) });
            } else console.error('Invalid channel ID or channel not found.');
        }
    }
);

commandBuild.create(
    {
        name: 'file',
        description: 'File Debug System',

    }, (message) => {
        message.delete();
        message.channel.send(`Please use this link to upload your file: https://blockstate.team/file`);
    }
);

commandBuild.create(
    {
        name: 'debug',
        description: 'Respond with a list of debug questions',

    }, (message) => {
        message.delete();
        message.channel.send(`
        ## Here are some questions that could help with the debug process: ##
        1. What's your Minecraft version?
        2. Where did you download the pack from? (MCPEDL or BlockState website)
        3. Have you enabled the required experimental toggle (if any)?
        4. What's the issue? (Screenshot or video would be helpful)
        5. Are you using any other packs?`);
    }
);

commandBuild.create(
    {
        name: 'hya',
        description: 'Hya screenshot',

    }, (message, args) => {
        message.delete();
        let request = parseInt(args[0], 10);
        let numberOfImage = 16; //The number of images in the collection.
        if (request > 0 && request <= numberOfImage) {
            message.channel.send(
                {
                    files: [
                        {
                            attachment: `./hya/${request}.png`,
                            name: 'hya.png'
                        }
                    ]
                }
            )
        } else {
            message.channel.send(
                {
                    files: [
                        {
                            attachment: `./hya/${Math.floor(Math.random() * numberOfImage + 1)}.png`,
                            name: 'hya.png'
                        }
                    ]
                }
            );
        }
    }
);

commandBuild.create(
    {
        name: 'ping',
        description: 'Reply with Pong!',

    }, (message) => {
        console.log("Ping received");
        let pong = ["Pong!", "Bruh, I'm online! No need to ping me", "No Pong!", "Nah, I ping you instead", "Stop pinging me", "Ping me one more time and I'll block you", "I'm reporting you to the admin for spamming ping", "Is this a ping? I can't tell", "Ping me again and see what happens"];
        message.reply(pong[Math.floor(Math.random() * pong.length)]);
    }
);

commandBuild.create(
    {
        name: 'meeting',
        description: 'Create a private meeting room',
    }, (message, args) => {
        if (!message.member.permissions.has([PermissionsBitField.Flags.KickMembers])) return;
        if (args.length > 0) {
            const allowUsers = [];
            args.forEach((word) => {
                const mentionMatch = word.match(/<@!?(\d+)>/);
                if (mentionMatch) { allowUsers.push(mentionMatch[1]); }
            });
            (async () => {
                try {
                    const guild = await client.guilds.fetch('1125667083544436758'); //Blockstate Server
                    const category = guild.channels.cache.find(channel => channel.id === '1133089437899829278');
                    if (!category) return console.log(`Category with '1133089437899829278' doesn't exist`);

                    let permissionOverwrites = [
                        {
                            id: guild.roles.everyone.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                            deny: [PermissionsBitField.Flags.Connect]
                        }
                    ];

                    allowUsers.forEach((user) => {
                        permissionOverwrites.push(
                            {
                                id: user,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
                            }
                        )
                    });

                    const meetingRoom = await guild.channels.create(
                        {
                            name: 'private-meeting-room',
                            type: 2,
                            parent: category.id,
                            permissionOverwrites
                        }
                    );

                    let invitation = `https://discord.com/channels/1125667083544436758/${meetingRoom.id}`;
                    let invitationRandom = [
                        "Hello! You've been invited to a private meeting.",
                        "Greetings! You've received an invitation to a confidential meeting.",
                        "Hey! You've been included in a private meeting invitation.",
                        "Hey there! You're formally invited to be part of a confidential meeting.",
                        "Hi! A special invitation has been extended to you for a private meeting.",
                        "Greetings! Join us privately for an exclusive meeting."
                    ];

                    for (const user of allowUsers) {
                        const targetUser = await client.users.fetch(user, false);
                        if (targetUser) targetUser.send(`${invitationRandom[Math.floor(Math.random() * invitationRandom.length)]}: ${invitation} \n In case the link doesn't work, the meeting may have end. Sorry for the inconvinience`);
                    };

                    message.reply(`Please enter the meeting room: ${invitation} Otherwise, it will automatically delete itself in 15 seconds.`).then((replyFirstMessage) => {
                        setTimeout(() => {
                            replyFirstMessage.delete();
                            message.delete();
                            if (meetingRoom && meetingRoom?.members?.size === 0) {
                                console.log("Nobody is in Meeting Room! Deleting Meeting Room");
                                meetingRoom.delete();
                            };
                        }, 15000);
                    });
                } catch (error) {
                    console.error('Error creating channel:', error);
                    message.reply("Something went wrong! No meeting room created");
                }
            })();
        } else message.reply({ content: 'You need to provide a list of members for the meeting!', ephemeral: true });
    }
);

commandBuild.create(
    {
        name: 'backup',
        description: 'Send backup link',

    }, (message) => {
        message.reply('Please use this link to download the backup: https://backup.blockstate.team');
    }
);

commandBuild.create(
    {
        name: 'project',
        description: 'Send project list',

    }, (message, args) => {
        function wrong() { message.reply('Something went wrong! Please try again later') };
        https.get('https://raw.githubusercontent.com/Andinh123/Backup/main/projectList.json', (response) => {
            if (response.statusCode === 200) {
                let data = '';
                response.on('data', (chunk) => { data += chunk; });
                response.on('end', () => {
                    try {
                        let jsonData = JSON.parse(data);
                        let projectList = "## Here's the list of projects: ## \n";
                        let Searchdata = [];
                        jsonData.forEach((projectItem) => {
                            let projectName = projectItem.project;
                            projectList += ` ### - ${projectName} ### \n`;
                            Searchdata.push(projectName.toLowerCase());
                        });
                        if (args.length > 0) {
                            const userQuery = args.join(' ').toLowerCase();
                            const results = bluesSearchEngine.findBestMatch(userQuery, Searchdata);
                            let preLink = jsonData[results.bestMatchIndex].internalLink.replace(/\./g, '');
                            let preName = jsonData[results.bestMatchIndex].project;
                            if (results.bestMatch.rating > 0.7) {
                                message.reply(`Here's the link to ${preName}: https://blockstate.team${preLink}`);
                            } else if (results.bestMatch.rating > 0.4) {
                                message.reply(`Did you mean ${preName}? Here's the link: https://blockstate.team${preLink}`);
                            } else {
                                message.reply('Project not found! Please check your spelling');
                            }
                        } else {
                            message.reply(projectList);
                        }
                    } catch (error) {
                        wrong();
                        console.log(error);
                    }
                });
            } else {
                wrong();
                console.error(`Request failed with status code ${response.statusCode}`);
            }
        }).on('error', (error) => {
            wrong();
            console.error(`Request failed: ${error.message}`);
        });
    }
);

commandBuild.create(
    {
        name: 'nuke',
        description: 'Mass delete message inside a channel',

    }, (message, args) => {
        if (!message.member.permissions.has([PermissionsBitField.Flags.KickMembers])) return;
        let nukeIndex = parseInt(args[0], 10);
        if (isNaN(nukeIndex)) { nukeIndex = 10 };
        if (typeof nukeIndex === 'number' && nukeIndex <= 10) {
            message.channel.send('https://tenor.com/view/nuke-gif-8044239')
                .then(() => {
                    setTimeout(() => {
                        (async () => {
                            for (let i = 1; i < nukeIndex; i++) {
                                try {
                                    const fetchedMessages = await message.channel.messages.fetch({ limit: 1 });
                                    const fetchedMessage = fetchedMessages.first();
                                    if (fetchedMessage) {
                                        await fetchedMessage.delete();
                                    } else {
                                        console.log("No messages to delete");
                                    }
                                } catch (error) {
                                    console.error("Error deleting message:", error.message);
                                }
                            }
                        })();
                    }, 2500);
                });
        } else { message.reply('You cannot nuke more than 10 messages') }
    }
);

commandBuild.create(
    {
        name: 'command',
        description: 'Provide info about available command!',

    }, (message, args) => {
        let commandList = `
        ## List of BlockState Bot command: ##
        blockstate.command [THIS COMMAND]
        blockstate.ping
        blockstate.help
        blockstate.rule [parameter: Number]
        blockstate.warn [Parameter: String]
        blockstate.file
        blockstate.debug
        blockstate.hya [Parameter: Number ( 1 -> 16 ) ]
        blockstate.meeting [Parameter: Mentioned User]
        blockstate.backup
        blockstate.project
        blockstate.nuke [Parameter: Number ( 1 -> 10 ) ]
        `;

        if (args.length > 0) {
            switch (args[0]) {
                case 'ping':
                    message.reply(`
                    ### Usage: blockstate.ping ### 
                    The bot will reply with an online-confirm message`);
                    break;
                case 'help':
                    message.reply(`
                    ### Usage: blockstate.help ### 
                    This command needs to be sent as a reply to the asking-for-help-message. The bot will ask the user to move to #help-and-communicate`);
                    break;
                case 'rule':
                    message.reply(`
                    ### Usage: blockstate.rule [parameter: Number] ### 
                    The bot will send the rule list upon the channel this command is called. Without a parameter, a full list will be sent`);
                    break;
                case 'warn':
                    message.reply(`
                    ### Usage: blockstate.warn [Parameter: String :: 'warning message'] ### 
                    This command needs to be sent as a reply to the warning message from the bot! The bot will send a warning message to the user who've said the sensitive words! Without the parameter, the bot will send the default warning`);
                    break;
                case 'file':
                    message.reply(`
                    ### Usage: blockstate.file ### 
                    The bot will send a link to a file sharing system for debug purpose`);
                    break;
                case 'debug':
                    message.reply(`
                    ### Usage: blockstate.debug ### 
                    The bot will send a list of questions that user can answer, upon doing so, providing crucial data for debuging`);
                    break;
                case 'hya':
                    message.reply(`
                    ### Usage: blockstate.hya [Parameter: Number ( 1 -> 16 ) ] ### 
                    The bot will send a screenshot from Hya's screenshot collection. Without the parameter, it will send a random picture from the collection`);
                    break;
                case 'meeting':
                    message.reply(`
                    ### Usage: blockstate.meeting [Parameter: Mentioned User ] ###
                    The bot will create a private meeting room for the mentioned user. Without the parameter, the bot will send an error message
                    `);
                    break;
                case 'backup':
                    message.reply(`
                    ### Usage: blockstate.backup ###
                    The bot will send a link to the backup system
                    `);
                    break;
                case 'project':
                    message.reply(`
                    ### Usage: blockstate.project [Parameter: String :: 'project name'] ###
                    Without any parameter, the bot will send a list of project. With the parameter, the bot will send the link to the project
                    `);
                    break;
                case 'nuke':
                    message.reply(`
                    ### Usage: blockstate.nuke [Parameter: Number ( 1 -> 10 ) ] ###
                    Without any parameter, the bot will mass delete 10 messages. With the parameter, the bot will delete the amount specified
                    `);
                    break;
                default:
                    message.reply(`Command not found!`);
                    break;
            }
        } else {
            message.reply("Command List sent and will be deleted in 10 seconds! You can use blockstate.command [Name of command] to know more about the command").then((replyFirstMessage) => { setTimeout(() => replyFirstMessage.delete(), 10000); });
            message.reply(commandList).then((replySecondMessage) => {
                setTimeout(() => {
                    replySecondMessage.delete();
                    message.delete();
                }, 10000);
            });
        };
    }
);

function extractImageSrc(htmlString) {
    const match = htmlString.match(/<img[^>]+src=["']([^"']+)["']/);
    if (match) { return match[1] } else { return 'https://www.minecraft.net/content/dam/archive/179ff4315b089ecbd5029ffb69bd0074-coarsedirt.png' }
};

async function discordInfoUpdate() {
    await fetch(
        "https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json?page=1&per_page=5",
        {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then((res) => res.json()).then(async (jsonData) => {
            let latestArticle = jsonData.articles[0];
            let previousArticle = require('./article.json');
            if (latestArticle.id !== previousArticle.id && !latestArticle.title.includes('Java Edition')) {
                console.log("New article detected");
                try { //A try-Catch statment to test weather the code works (Code not tested).
                    let updateMb = new EmbedBuilder();
                    updateMb.setTitle(latestArticle.title)
                        .setURL(latestArticle.html_url)
                        .setColor('Green')
                        .setImage(extractImageSrc(latestArticle.body))
                        .setTimestamp();
                    (async () => {
                        try {
                            const blockstateDiscord = await client.guilds.fetch('1125667083544436758');
                            const forum = await blockstateDiscord.channels.fetch('1178277908180127785'); //1178277908180127785 is Minecraft Update Channel
                            forum.threads.create({ name: latestArticle.title, message: { embeds: [updateMb] } });
                            fs.writeFile('./article.json', JSON.stringify(latestArticle), function (err) {
                                if (err) throw err;
                                console.log('Saved!');
                            });
                        } catch (error) { console.error('Error fetching guild or channel:', error.message); }
                    })();
                } catch (error) { console.log(error); }
            }
        });
}

discordInfoUpdate();
setInterval(discordInfoUpdate, 900000);
client.login(token);