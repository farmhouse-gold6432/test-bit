const { Client, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');

const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages
        ]
    }
);

client.once(Events.ClientReady, () => {
    console.info(`Bot is ready!`)
})

client.login(token); // A comment.