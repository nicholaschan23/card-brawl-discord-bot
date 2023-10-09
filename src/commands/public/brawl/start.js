const { SlashCommandSubcommandBuilder } = require("discord.js");
const { delay } = require("../../../functions/delay");
const { formatTitle } = require("../../../functions/formatTitle");
const {
    getIntroductionEmbed,
} = require("../../../functions/embeds/brawlIntroduction");
const {
    getConclusionEmbed,
} = require("../../../functions/embeds/brawlConclusion");
const { client } = require("../../../index");
const config = require("../../../../config.json");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");
const BrawlBracketHelper = require("../../../classes/BrawlBracketHelper");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Start a Card Brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the Card Brawl you are starting.")
                .setRequired(true)
        ),
    async execute(interaction) {
        if (
            !interaction.member.roles.cache.some(
                (role) => role.name === "Owner"
            )
        ) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        let name = formatTitle(interaction.options.getString("name"));

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                return await interaction.reply(
                    `No Card Brawl found with the name **${name}**.`
                );
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            return await interaction.reply(
                `There was an error retrieving the Card Brawl.`
            );
        }

        // Check eligibility
        const current = setupModel.cards.size;
        const goal = setupModel.size;
        if (current !== goal) {
            return await interaction.reply(
                `This Card Brawl needs **${
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
            console.log("Error retrieving Card Brawl setups:", error);
            return await interaction.reply(
                "There was an error retrieving the Card Brawl bracket."
            );
        }

        // Get competitors and create brawl bracket
        const judgesChannel = client.channels.cache.get(config.judgesChannelID);
        const myBrawlBracket = new BrawlBracketHelper(
            judgesChannel,
            bracketModel,
            setupModel
        );

        // Check if in progress, finished, etc.
        if (myBrawlBracket.getStatus() === 2) {
            return await interaction.reply(
                `The **${setupModel.name}** Card Brawl has already finished!`
            );
        }
        if (myBrawlBracket.getStatus() === 1) {
            await interaction.reply(
                `Resuming the **${setupModel.name}** Card Brawl...`
            );
            await judgesChannel.send(
                `Resuming the **${setupModel.name}** Card Brawl...`
            );
        } else if (myBrawlBracket.getStatus() === 0) {
            await myBrawlBracket.generateInitialBracket();
            await interaction.reply(
                `Starting the **${setupModel.name}** Card Brawl...`
            );

            // Introduction
            const message = await judgesChannel.send({
                content: `We'll be starting in \`1 minute\`. <@&${config.judgeRole}>`,
                embeds: [getIntroductionEmbed(setupModel)],
            });
            await message.react("🥳");
            await delay(30);
            await judgesChannel.send("# 30");
            await delay(10);
            await judgesChannel.send("# 10");
            await delay(17);
            await judgesChannel.send("# 3");
            await delay(1);
            await judgesChannel.send("# 2");
            await delay(1);
            await judgesChannel.send("# 1");
            await delay(1);
            await judgesChannel.send("# Let the Card Brawl begin! 🥊");
            await delay(2);
        }
        // Resume or start card brawl
        await myBrawlBracket.conductTournament();
        await delay(3);
        const message = await judgesChannel.send({
            embeds: [getConclusionEmbed()],
        });
        await message.react("🎉");
    },
};
