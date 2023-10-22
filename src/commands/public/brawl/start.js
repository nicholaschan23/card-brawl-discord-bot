const { SlashCommandSubcommandBuilder } = require("discord.js");
const { getAnnouncementEmbed } = require("../../../functions/embeds/brawlAnnouncement");
const { delay } = require("../../../functions/delay");
const { formatTitle } = require("../../../functions/formatTitle");
const { getIntroductionEmbed } = require("../../../functions/embeds/brawlIntroduction");
const { getConclusionEmbed } = require("../../../functions/embeds/brawlConclusion");
const { client, setupModelQueue } = require("../../../index");
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
                return await interaction.reply(`No Card Brawl found with the name **${name}**.`);
            }
        } catch (error) {
            console.error("[BRAWL START] Error retrieving BrawlSetupModel:", error);
            return await interaction.reply(`Error retrieving Card Brawl.`);
        }
        console.log("[BRAWL START] Found BrawlSetupModel");

        // Close card competition
        if (setupModel.open) {
            const task = async () => {
                setupModel = await BrawlSetupModel.findOne({ name }).exec();
                setupModel.open === false;
                await setupModel.save();

                const competitorsChannel = client.channels.cache.get(config.competitorsChannelID);
                competitorsChannel.messages.fetch(setupModel.messageID).then((message) => {
                    const updatedEmbed = getAnnouncementEmbed(setupModel);
                    updatedEmbed.setColor(config.red);
                    updatedEmbed.setFooter({
                        text: "This Card Brawl is closed!",
                    });
                    message.edit({
                        content: `The \`${setupModel.name}\` Card Brawl is closed! 🥊 <@&${config.competitorRole}>`,
                        embeds: [updatedEmbed],
                    });
                });
            };
            await setupModelQueue.enqueue(task);
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
        const judgesChannel = client.channels.cache.get(config.judgesChannelID);
        const myBrawlBracket = new BrawlBracketHelper(bracketModel, setupModel);

        // Check if in progress, finished, etc.
        if (myBrawlBracket.getStatus() === 2) {
            return await interaction.reply(
                `The **${setupModel.name}** Card Brawl has already finished!`
            );
        }
        if (myBrawlBracket.getStatus() === 1) {
            await interaction.reply(`Resuming the **${setupModel.name}** Card Brawl...`);
            await judgesChannel.send(`Resuming the **${setupModel.name}** Card Brawl...`);
        } else if (myBrawlBracket.getStatus() === 0) {
            await myBrawlBracket.generateInitialBracket();
            await interaction.reply(`Starting the **${setupModel.name}** Card Brawl...`);

            // Introduction
            const message = await judgesChannel.send({
                content: `We'll be starting in \`5 minutes\`. <@&${config.judgeRole}>`,
                embeds: [getIntroductionEmbed(setupModel)],
            });
            await message.react("🥳");
            await delay(297);
            await judgesChannel.send("# 3");
            await delay(1);
            await judgesChannel.send("# 2");
            await delay(1);
            await judgesChannel.send("# 1");
            await delay(1);
            await judgesChannel.send("# Let the Card Brawl begin! 🥊");
            await delay(2);
            await judgesChannel.send(
                "If you don't see your card in **Round 1**, you've received a free pass to **Round 2**! We may skip a few matches..."
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
