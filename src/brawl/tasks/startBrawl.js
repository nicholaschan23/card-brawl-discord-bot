const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const BrawlBracketHelper = require("../classes/BrawlBracketHelper");
const BrawlBracketModel = require("../schemas/brawlBracketSchema");
const BrawlSetupModel = require("../schemas/brawlSetupSchema");
const ScheduleModel = require("../../schedule/schemas/scheduleSchema");
const delay = require("../src/delay");
const getAnnouncementEmbed = require("../embeds/brawlAnnouncement");
const getIntroductionEmbed = require("../embeds/brawlIntroduction");
const getConclusionEmbed = require("../embeds/brawlConclusion");
const client = require("../../index");
const config = require("../../../config.json");

async function startBrawl(data) {
    const name = data.name;

    // Get BrawlSetupModel
    const setupModel = await BrawlSetupModel.findOne({ name }).exec();

    // Close card competition
    if ((setupModel.open = true)) {
        const task = async () => {
            setupModel.open = false;
            await setupModel.save();

            const competitorsChannel = client.channels.cache.get(
                config.channelID.brawlCompetitors
            );
            competitorsChannel.messages.fetch(setupModel.messageID).then((message) => {
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
    }

    // Get BrawlBracketModel
    let bracketModel = await BrawlBracketModel.findOne({ name }).exec();
    if (!bracketModel) {
        // Create brawl bracket model in database if it doesn't exist
        bracketModel = new BrawlBracketModel({
            name: setupModel.name,
            competitors: [...setupModel.cards.keys()],
        });
        await bracketModel.save();
    }

    // Get BrawlBracketHelper
    const myBrawlBracket = new BrawlBracketHelper(bracketModel, setupModel);

    // Channel to send messages
    const judgesChannel = client.channels.cache.get(config.channelID.brawlJudges);

    if (myBrawlBracket.getStatus() === 2) {
        // Delete schedule
        try {
            const name = data.scheduleName;
            await ScheduleModel.deleteOne({ name }).exec();
            console.log(`[BRAWL START] ${name} schedule deleted`);
        } catch (error) {
            console.error(`[BRAWL START] Error deleting schedule ${name}:`, error);
        }
        return;
    }
    if (myBrawlBracket.getStatus() === 1) {
        await judgesChannel.send(
            `<@&${config.roleID.brawlJudge}> An unexpected crash occurred. Resuming the **${setupModel.name}** Card Brawl...`
        );
        await delay(3);
    } else if (myBrawlBracket.getStatus() === 0) {
        // Get competitors and generate brawl bracket
        myBrawlBracket.generateInitialBracket();

        // Introduction
        let message = await judgesChannel.send({
            content: `We'll be starting in \`5 minutes\`. <@&${config.roleID.brawlJudge}>`,
            embeds: [getIntroductionEmbed(setupModel)],
        });

        try {
            const content = `:boxing_glove: **A Card Brawl will be starting in \`5 minutes\`!** Get ready to cast your votes in the <#${config.channelID.brawlJudges}> channel.`;
            const main = client.channels.cache.get(config.channelID.karutaMain);
            const drop = client.channels.cache.get(config.channelID.karutaDrop);
            main.send({
                content: content,
            });
            drop.send({
                content: content,
            });
        } catch (e) {}

        await message.react("🥳");
        await delay(360);
        await judgesChannel.send("## 1 minute");
        await delay(27);
        await judgesChannel.send("# 3");
        await delay(1);
        await judgesChannel.send("# 2");
        await delay(1);
        await judgesChannel.send("# 1");
        await delay(1);
        await judgesChannel.send("# Let the Card Brawl begin! 🥊");

        try {
            const content = `:boxing_glove: **A Card Brawl has just started!** Go and cast your votes now in the <#${config.channelID.brawlJudges}> channel.`;
            const main = client.channels.cache.get(config.channelID.karutaMain);
            const drop = client.channels.cache.get(config.channelID.karutaDrop);
            main.send({
                content: content,
            });
            drop.send({
                content: content,
            });
        } catch (e) {}

        await delay(2);
        await judgesChannel.send(
            "If you don't see your card in **Round 1**, you've received a free pass to **Round 2**!"
        );
        await delay(2);
    }

    // Start or resume tournament
    await myBrawlBracket.conductTournament();

    await delay(3);
    const competitorButton = new ButtonBuilder()
        .setCustomId("toggleBrawlCompetitor")
        .setLabel("Brawl Competitor")
        .setStyle(ButtonStyle.Primary);
    const judgeButton = new ButtonBuilder()
        .setCustomId("toggleBrawlJudge")
        .setLabel("Brawl Judge")
        .setStyle(ButtonStyle.Primary);
    const statsButton = new ButtonBuilder()
        .setLabel("View Stats")
        .setCustomId("viewUserStats")
        .setStyle(ButtonStyle.Success);
    const supportButton = new ButtonBuilder()
        .setLabel("Server Subscriber")
        .setURL(config.serverShop)
        .setStyle(ButtonStyle.Link);
    const row = new ActionRowBuilder().addComponents(
        competitorButton,
        judgeButton,
        statsButton,
        supportButton
    );
    message = await judgesChannel.send({
        embeds: [getConclusionEmbed()],
        components: [row],
    });

    // Delete schedule
    try {
        const name = data.scheduleName;
        await ScheduleModel.deleteOne({ name }).exec();
        console.log(`[BRAWL START] ${name} schedule deleted`);
    } catch (error) {
        console.error(`[BRAWL START] Error deleting schedule ${name}:`, error);
    }
}

module.exports = startBrawl;
