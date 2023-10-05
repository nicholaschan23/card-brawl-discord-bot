const { SlashCommandSubcommandBuilder } = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");
const { getWinnerEmbed } = require("../../../functions/embeds/brawlWinner")

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("winner")
        .setDescription("Retrieve a past Card Brawl's winner.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the Card Brawl to look up.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { formatTitle } = require("../../../functions/formatTitle");
        const name = formatTitle(interaction.options.getString("name"));
        try {
            // Check if brawl exists
            const bracketModel = await BrawlBracketModel.findOne({ name }).exec();
            if (bracketModel) {
                const setupModel = await BrawlSetupModel.findOne({ name }).exec();
                if (bracketModel.completedMatches.length === bracketModel.competitors.length - 1) {
                    interaction.reply({embeds: [getWinnerEmbed(bracketModel, setupModel)]})
                }
                else {
                    interaction.reply(`This Card Brawl has no winner yet.`);
                }
            } else {
                interaction.reply(`There is no Card Brawl with that name.`);
            }
        } catch (error) {
            console.log("Error retrieving brawl bracket:", error);
            interaction.reply(`There was an error retrieving the Card Brawl winner.`);
        }
    },
};
