const { SlashCommandSubcommandBuilder } = require("discord.js");
const {
    getInstructionsEmbed,
} = require("../../../functions/embeds/brawlInstructions");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("instructions")
        .setDescription("Instructions on how to play."),
    async execute(interaction) {
        await interaction.reply({
            embeds: [getInstructionsEmbed()],
            ephemeral: true,
        });
    },
};
