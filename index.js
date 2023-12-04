const { Client, GatewayIntentBits, Intents } = require('discord.js');
const token = 'MTE3NjQ5MzY2MDEwNDI5ODUxNg.GpvlCa.GlK8QEmnB_DJcd8nFSJFWx6UNF-FVFXSaQrmMI';
const prefix = 'DF.';

const client = new Client({
  intents: [
    512
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignore messages from bots
  if (!message.content.startsWith(prefix)) return; // Ignore messages that don't start with the prefix

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.reply('Pong!');
  } else if (command === 'hello') {
    message.reply('Hello!');
  }
  // Add more commands as needed
});

client.login(token);
