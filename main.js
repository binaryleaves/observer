const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const Keyv = require('keyv');
const fs = require('node:fs');
const path = require('node:path');

const CLIENT_ID = "981742038875791402";
const GUILD_ID = "980239581653913630";

const rest = new REST({ version: '9' }).setToken('');

const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MEMBERS] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.commands = new Collection();
  client.keyv = new Keyv('sqlite://list.sqlite');
  client.keyv.on('error', err => console.error('Keyv connection error:', err));
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for(const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
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

client.login('');
