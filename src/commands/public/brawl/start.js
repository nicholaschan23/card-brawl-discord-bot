const { SlashCommandSubcommandBuilder, EmbedBuilder } = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");
const BrawlBracketHelper = require("../../../classes/BrawlBracketHelper");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Start a card brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the card brawl you are starting.")
                .setRequired(true)
        ),
    async execute(interaction) {
        let name = interaction.options.getString("name");
        name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                interaction.reply(`No brawl found with the name "${name}".`);
                return;
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            interaction.reply(`There was an error retrieving the brawl.`);
            return;
        }

        // Check eligibility
        const current = setupModel.cards.size;
        const goal = setupModel.size;
        if (current !== goal) {
            await interaction.reply(
                `This card brawl needs **${
                    goal - current
                }** more contestant(s)! Only **${current}/${goal}** cards have been submitted.`
            );
        }

        // Resume brawl
        let bracketModel;
        try {
            bracketModel = await BrawlBracketModel.findOne({ name }).exec();
            if (!bracketModel) {
                // Create brawl bracket model in database if it doesn't exist
                bracketModel = new BrawlBracketModel({
                    name: setupModel.name,
                    competitors: [...setupModel.cards.keys()],
                });
                await bracketModel.save();
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            interaction.reply(
                "There was an error retrieving the brawl bracket."
            );
            return;
        }

        // Get competitors and create brawl bracket
        const myBrawlBracket = new BrawlBracketHelper(
            interaction,
            bracketModel,
            setupModel
        );

        // Check if in progress, finished, etc.
        if (myBrawlBracket.getStatus() === 2) {
            await interaction.reply(
                `The **${setupModel.name}** card brawl is already finished!`
            );
            return;
        }
        if (myBrawlBracket.getStatus() === 1) {
            await interaction.reply(
                `Resuming the **${setupModel.name}** card brawl...`
            );
        } else if (myBrawlBracket.getStatus() === 0) {
            await myBrawlBracket.generateInitialBracket();
            await interaction.reply(
                `Welcome to the **${setupModel.name}** card brawl! There are ${setupModel.size} cards in this  etc.`
            );
            
        }
        // Resume or start card brawl
        await myBrawlBracket.conductTournament();
    },
};
