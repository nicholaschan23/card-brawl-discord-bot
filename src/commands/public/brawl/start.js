const { SlashCommandSubcommandBuilder } = require("discord.js");
const BrawlBracketHelper = require("../../../brawl/classes/BrawlBracketHelper");
const BrawlBracketModel = require("../../../brawl/schemas/brawlBracketSchema");
const BrawlSetupModel = require("../../../brawl/schemas/brawlSetupSchema");
const delay = require("../../../brawl/src/delay");
const getAnnouncementEmbed = require("../../../brawl/embeds/brawlAnnouncement");
const getConclusionEmbed = require("../../../brawl/embeds/brawlConclusion");
const getIntroductionEmbed = require("../../../brawl/embeds/brawlIntroduction");
const formatTitle = require("../../../brawl/src/formatTitle");
const client = require("../../../index");
const config = require("../../../../config.json");

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
        // Owner permissions
        if (!interaction.member.roles.cache.some((role) => role.name === "Owner")) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const name = formatTitle(interaction.options.getString("name"));

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
            console.error("[BRAWL START] Error retrieving BrawlSetupModel:", error);
            return await interaction.reply(`Error retrieving Card Brawl.`);
        }
        console.log("[BRAWL START] Found BrawlSetupModel");

        // Close card competition
        if (setupModel.open) {
            const task = async () => {
                setupModel.open = false;
                await setupModel.save();

                const competitorsChannel = await client.channels.fetch(
                    config.channelID.brawCompetitors
                );
                competitorsChannel.messages
                    .fetch(setupModel.messageID)
                    .then((message) => {
                        const updatedEmbed = getAnnouncementEmbed(setupModel);
                        updatedEmbed.setColor(config.embed.red);
                        updatedEmbed.setFooter({
                            text: "This Card Brawl is closed!",
                        });
                        message.edit({
                            content: `The \`${setupModel.name}\` Card Brawl is closed! 🥊 <@&${config.roleID.brawlCompetitor}>`,
                            embeds: [updatedEmbed],
                        });
                    });
            };
            await client.setupModelQueue.enqueue(task);
            console.log("[BRAWL START] Closed Card Brawl");
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
            console.error("[BRAWL START] Error retrieving BrawlBracketModel:", error);
            return await interaction.reply("Error retrieving the Card Brawl bracket.");
        }

        // Get competitors and create brawl bracket
        const judgesChannel = await client.channels.fetch(config.channelID.brawJudges);
        const myBrawlBracket = new BrawlBracketHelper(bracketModel, setupModel);

        // Check if in progress, finished, etc.
        if (myBrawlBracket.getStatus() === 2) {
            await interaction.reply(
                `The **${setupModel.name}** Card Brawl has already finished!`
            );
            return;
        }
        if (myBrawlBracket.getStatus() === 1) {
            await interaction.reply(`Resuming the **${setupModel.name}** Card Brawl...`);
            await judgesChannel.send(`Resuming the **${setupModel.name}** Card Brawl...`);
        } else if (myBrawlBracket.getStatus() === 0) {
            await myBrawlBracket.generateInitialBracket();
            await interaction.reply(`Starting the **${setupModel.name}** Card Brawl...`);

            // Introduction
            const message = await judgesChannel.send({
                content: `We'll be starting in \`${
                    config.brawl.startTime / 60
                } minutes\`. <@&${config.roleID.brawlJudge}>`,
                embeds: [getIntroductionEmbed(setupModel)],
            });
            await message.react("🥳");
            await delay(config.brawl.startTime - 3);
            await judgesChannel.send("# 3");
            await delay(1);
            await judgesChannel.send("# 2");
            await delay(1);
            await judgesChannel.send("# 1");
            await delay(1);
            await judgesChannel.send("# Let the Card Brawl begin! 🥊");
            await delay(2);
            await judgesChannel.send(
                "If you don't see your card in **Round 1**, you're lucky and automatically are in **Round 2**! Skipping a few matches..."
            );
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
