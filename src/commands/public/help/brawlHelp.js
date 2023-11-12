const { SlashCommandSubcommandBuilder } = require("discord.js");
const getBrawlHelpEmbed = require("../../../brawl/embeds/brawlHelp");

module.exports = {
    category: "public/help",
    data: new SlashCommandSubcommandBuilder()
        .setName("brawl")
        .setDescription("How to participate in Card Brawl."),
    async execute(interaction) {
        await interaction.reply({
            embeds: [getBrawlHelpEmbed()],
            ephemeral: true,
        });
    },
};
