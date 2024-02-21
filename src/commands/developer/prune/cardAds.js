const { SlashCommandSubcommandBuilder } = require("discord.js");
const { removeOldAds } = require("../../../sell/src/removeOldAds")

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("card-ads")
        .setDescription("Delete week-old card ads."),
    category: "developer/prune",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await removeOldAds();
        await interaction.editReply({content: "Done deleting card ads!"})
    },
};
