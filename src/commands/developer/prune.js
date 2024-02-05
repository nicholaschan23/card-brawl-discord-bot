const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { removeInactive } = require("../../inactive/src/removeInactive")
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prune")
        .setDescription("Prune inactive players.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "developer",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await removeInactive();
        await interaction.editReply({content: "Done pruning inactive members!"})
    },
};
