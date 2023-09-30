const { SlashCommandSubcommandBuilder } = require("discord.js");
const {
    getInstructionsEmbed,
} = require("../../../functions/embeds/brawlInstructions");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("instructions")
        .setDescription("Card Brawl instructions on how to play."),
    async execute(interaction) {
        interaction.reply({
            embeds: [getInstructionsEmbed()],
        });
    },
};
