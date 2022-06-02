const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broomsweep')
    .setDescription('Calls a janitor to sweep up the database.'),
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'broomsweep') {
      for await (const [key,value] of interaction.client.keyv.iterator()) {
        const memb = interaction.guild.members.cache.find(user => user.id === key);
        if (memb === undefined) {
          await interaction.client.keyv.delete(key);
        }
      };
      await interaction.reply('Done!');
    }
  },
};
