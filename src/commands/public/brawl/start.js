const { SlashCommandSubcommandBuilder } = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");
const BrawlBracketHelper = require("../../../classes/BrawlBracketHelper");
const { delay } = require("../../../functions/delay");
const client = require("../../../index");
const config = require("../../../../config.json");
const {
    getIntroductionEmbed,
} = require("../../../functions/embeds/brawlIntroduction");
const {
    getConclusionEmbed,
} = require("../../../functions/embeds/brawlConclusion");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Start a card competition.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name of the card brawl you are starting.")
                .setRequired(true)
        ),
    async execute(interaction) {
        if (
            !interaction.member.roles.cache.some(
                (role) => role.name === "Owner"
            )
        ) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        let name = interaction.options.getString("name");
        name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                await interaction.reply(`No brawl found with the name "${name}".`);
                return;
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            await interaction.reply(`There was an error retrieving the brawl.`);
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
            return;
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
            await interaction.reply(
                "There was an error retrieving the brawl bracket."
            );
            return;
        }

        // Get competitors and create brawl bracket
        const arenaChannel = client.channels.cache.get(config.arenaChannelID);
        const myBrawlBracket = new BrawlBracketHelper(
            arenaChannel,
            bracketModel,
            setupModel
        );

        // Check if in progress, finished, etc.
        if (myBrawlBracket.getStatus() === 2) {
            await interaction.reply(
                `The **${setupModel.name}** card brawl has already finished!`
            );
            return;
        }
        if (myBrawlBracket.getStatus() === 1) {
            await interaction.reply(
                `Resuming the **${setupModel.name}** Card Brawl...`
            );
            await arenaChannel.send(
                `Resuming the **${setupModel.name}** Card Brawl...`
            );
        } else if (myBrawlBracket.getStatus() === 0) {
            await myBrawlBracket.generateInitialBracket();
            await interaction.reply(
                `Starting the **${setupModel.name}** Card Brawl...`
            );

            // Introduction
            const message = await arenaChannel.send({
                content: `We'll be starting in \`1 minute\`. <@&${config.judgeRole}>`,
                embeds: [getIntroductionEmbed(setupModel)],
            });
            await message.react("🥳");
            await delay(1); // 26
            await arenaChannel.send("# 3");
            await delay(1);
            await arenaChannel.send("# 2");
            await delay(1);
            await arenaChannel.send("# 1");
            await delay(1);
            await arenaChannel.send("# Let the Card Brawl begin! 🥊");
            await delay(2);
        }
        // Resume or start card brawl
        await myBrawlBracket.conductTournament();
        await delay(3);
        await arenaChannel.send({
            embeds: [getConclusionEmbed()],
        });
    },
};
