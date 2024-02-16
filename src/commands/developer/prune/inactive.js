const { SlashCommandSubcommandBuilder } = require("discord.js");
const { removeInactive } = require("../../../inactive/src/removeInactive")

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("inactive")
        .setDescription("Prune inactive players."),
    category: "developer/prune",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await removeInactive();
        await interaction.editReply({content: "Done pruning inactive members!"})
    },
};
