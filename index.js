const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages
        ]
    }
);

client.login(token);