const getAnnouncementEmbed = require("../embeds/brawlAnnouncement");
const getIntroductionEmbed = require("../embeds/brawlIntroduction");
const getConclusionEmbed = require("../embeds/brawlConclusion");
const delay = require("../src/delay");
const client = require("../../index");
const config = require("../../../config.json");
const BrawlSetupModel = require("../schemas/brawlSetupSchema");
const BrawlBracketModel = require("../schemas/brawlBracketSchema");
const ScheduleModel = require("../../schedule/schemas/scheduleSchema");
const BrawlBracketHelper = require("../classes/BrawlBracketHelper");

async function startBrawl(data) {
    const name = data.name;

    // Get BrawlSetupModel
    const setupModel = await BrawlSetupModel.findOne({ name }).exec();

    // Close card competition
    if ((setupModel.open = true)) {
        const task = async () => {
            setupModel.open = false;
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
        client.setupModelQueue.enqueue(task);
    }

    // Get BrawlBracketModel
    const bracketModel = await BrawlBracketModel.findOne({ name }).exec();
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
    const judgesChannel = client.channels.cache.get(config.judgesChannelID);

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
            `<@&${config.judgeRole}> An unexpected crash occured. Resuming the **${setupModel.name}** Card Brawl...`
        );
        await delay(3);
    } else if (myBrawlBracket.getStatus() === 0) {
        // Get competitors and generate brawl bracket
        await myBrawlBracket.generateInitialBracket();

        // Introduction
        let message = await judgesChannel.send({
            content: `We'll be starting in \`5 minutes\`. <@&${config.judgeRole}>`,
            embeds: [getIntroductionEmbed(setupModel)],
        });
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
        await delay(2);
        await judgesChannel.send(
            "If you don't see your card in **Round 1**, you've received a free pass to **Round 2**!"
        );
        await delay(2);
    }

    // Start or resume tournament
    await myBrawlBracket.conductTournament();
    await delay(3);
    message = await judgesChannel.send({
        embeds: [getConclusionEmbed()],
    });
    await message.react("🎉");

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
