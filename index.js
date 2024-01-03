const { Client, GatewayIntentBits, Events, REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json');

const client = new Client(
    {
        intents: [
            GatewayIntentBits.AutoModerationConfiguration || 1048576,
            GatewayIntentBits.AutoModerationExecution || 2097152,
            GatewayIntentBits.DirectMessageReactions || 8192,
            GatewayIntentBits.DirectMessageTyping || 16384,
            GatewayIntentBits.DirectMessages || 4096,
            GatewayIntentBits.GuildEmojisAndStickers || 8,
            GatewayIntentBits.GuildInvites || 64,
            GatewayIntentBits.GuildIntegrations || 16,
            GatewayIntentBits.GuildMembers || 2,
            GatewayIntentBits.GuildMessageReactions || 1024,
            GatewayIntentBits.GuildMessages || 512,
            GatewayIntentBits.GuildModeration || 4,
            GatewayIntentBits.GuildPresences || 256,
            GatewayIntentBits.GuildScheduledEvents || 65536,
            GatewayIntentBits.GuildVoiceStates || 128,
            GatewayIntentBits.GuildWebhooks || 32,
            GatewayIntentBits.Guilds || 1,
            GatewayIntentBits.MessageContent || 32768,
        ]
    }
);

const rest = new REST({ version: '10' }).setToken(token);

client.once('ready', async (data) => {
    console.log(`Logged in as ${data.user.tag}!`);
    try {
        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: [
                {
                    name: "ping",
                    description: "A ping command"
                }
            ]
        });
        console.log(`Successfully reloaded ${data.length} (/) commands.`);
    } catch (error) { console.error(`Error while registering ${data.length} (/) commands: ${error}`) };
});

client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ping') {
        interaction.reply('Pong!')
    }
})

client.login(token);