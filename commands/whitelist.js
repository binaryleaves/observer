const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Whitelists a specified user.')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('The ID of the user to whitelist.')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'whitelist') {
      const userid = interaction.options.getString('userid');
      await interaction.client.keyv.set(userid, 'white');
    } await interaction.reply('Done!');
  },
};
