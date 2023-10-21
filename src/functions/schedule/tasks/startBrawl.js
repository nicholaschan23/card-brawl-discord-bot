const { delay } = require("../../delay");
const { getIntroductionEmbed } = require("../../embeds/brawlIntroduction");
const { getConclusionEmbed } = require("../../embeds/brawlConclusion");
const { client, setupModelQueue } = require("../../../index");
const config = require("../../../../config.json");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlBracketModel = require("../../../data/schemas/brawlBracketSchema");
const BrawlBracketHelper = require("../../../classes/BrawlBracketHelper");
const ScheduleModel = require("../../../data/schemas/scheduleSchema")

async function startBrawl(data) {
    const name = data.name;

    // Close card competition
    const task = async () => {
        const recentSetupModel = await BrawlSetupModel.findOne({ name }).exec();
        recentSetupModel.open === false;
        await recentSetupModel.save();

        const competitorsChannel = client.channels.cache.get(config.competitorsChannelID);
        competitorsChannel.messages.fetch(recentSetupModel.messageID).then((message) => {
            const updatedEmbed = new getAnnouncementEmbed(
                recentSetupModel.name,
                recentSetupModel.theme,
                recentSetupModel.series,
                recentSetupModel.cards.size
            );
            updatedEmbed.setColor(config.red);
            updatedEmbed.setFooter({
                text: "This Card Brawl is closed!",
            });
            message.edit({
                content: `The \`${recentSetupModel.name}\` Card Brawl is closed! 🥊 <@&${config.competitorRole}>`,
                embeds: [updatedEmbed],
            });
        });
        await setupModelQueue.enqueue(task);

        // Create new BracketModel
        const setupModel = await BrawlSetupModel.findOne({ name }).exec();
        const bracketModel = new BrawlBracketModel({
            name: setupModel.name,
            competitors: [...setupModel.cards.keys()],
        });
        await bracketModel.save();

        // Get competitors and generate brawl bracket
        const myBrawlBracket = new BrawlBracketHelper(bracketModel, setupModel);
        await myBrawlBracket.generateInitialBracket();

        const judgesChannel = client.channels.cache.get(config.judgesChannelID);
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

        // Start tournament
        await myBrawlBracket.conductTournament();
        await delay(3);
        message = await judgesChannel.send({
            embeds: [getConclusionEmbed()],
        });
        await message.react("🎉");

        // Delete schedule
        try {
            const name = data.scheduleName
            await ScheduleModel.deleteOne({ name }).exec();
            console.log(`[INFO] ${name} schedule deleted.`)
        } catch (error) {
            console.error(`[ERROR] Deleting schedule ${name}:`, error)
        }
    };
}

module.exports = startBrawl;
