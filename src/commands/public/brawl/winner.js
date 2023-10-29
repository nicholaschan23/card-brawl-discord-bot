const { SlashCommandSubcommandBuilder } = require("discord.js");
const { formatTitle } = require("../../../functions/formatTitle");
const { getWinnerEmbed } = require("../../../functions/embeds/brawlWinner");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("winner")
        .setDescription("Retrieve a past Card Brawl winner.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the Card Brawl to look up.")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction) {
        const name = formatTitle(interaction.options.getString("name"));
        try {
            // Check if brawl exists
            const setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                return await interaction.reply(`That Card Brawl does not exist.`);
            }

            const bracketModel = await BrawlBracketModel.findOne({ name }).exec();
            if (bracketModel) {
                const idealSize = Math.pow(2, Math.ceil(Math.log2(setupModel.cards.size)));
                if (bracketModel.completedMatches.length === idealSize - 1) {
                    await interaction.reply({ embeds: [getWinnerEmbed(bracketModel, setupModel)] });
                } else {
                    await interaction.reply(`That Card Brawl has no winner yet.`);
                }
            } else {
                await interaction.reply(`That Card Brawl has not started yet.`);
            }
        } catch (error) {
            console.error("[BRAWL WINNER] Error retrieving BrawkBracketModel:", error);
            await interaction.reply(`Error retrieving the Card Brawl winner.`);
        }
    },
};
