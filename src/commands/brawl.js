const { SlashCommandBuilder } = require('@discordjs/builders');
const create = require('./subcommands/brawlCreate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('brawl')
    // .setDescription('Main command with subcommands'),
    .addSubcommand(create.data)
//   async execute(interaction) {
//     await interaction.reply('This is the main command. Use subcommands for more options.');
//   }
};