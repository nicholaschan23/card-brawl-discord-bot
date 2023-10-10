const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    category: "developer",
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test main command.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.reply("Test");
    },
};
