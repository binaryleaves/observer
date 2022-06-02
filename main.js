const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const Keyv = require('keyv');
const sqlite = require('@keyv/sqlite');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config.json');
const blacklist = require('./commands/blacklist.js');
const whitelist = require('./commands/whitelist.js');
const broomsweep = require('./commands/broomsweep.js');

const CLIENT_ID = config.clientId;
const GUILD_ID = config.guildId;

const rest = new REST({ version: '9' }).setToken(config.token);

const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MEMBERS] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.keyv = new Keyv('sqlite://list.sqlite');
  client.keyv.on('error', err => console.error('Keyv connection error:', err));
  const commands = [];
  commands.push(blacklist.data.toJSON());
  commands.push(whitelist.data.toJSON());
  commands.push(broomsweep.data.toJSON());
  rest.put(Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('guildMemberAdd', async member => {
  var friendly = false;
  for await (const [key,value] of client.keyv.iterator()) {
    if (value === 'black' && key === member.id) {
      member.kick();
    } else if (value === 'white' && key === member.id) {
      friendly = !friendly;
    }
  } if (friendly === false) {
    member.kick();
  }
});

client.login(config.token);
