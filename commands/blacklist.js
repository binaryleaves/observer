const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklists a specified user.')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to blacklist.')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'blacklist') {
      const userid = interaction.options.getString('userid');
      await interaction.client.keyv.set(userid, 'black');
    } await interaction.reply('Done!');
  },
};
