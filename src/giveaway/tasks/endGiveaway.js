const { ActionRowBuilder, EmbedBuilder } = require("discord.js");
const rollWinner = require("../src/rollWinner");
const client = require("../../index");
const gconfig = require("../../giveaway/giveaway-config.json");
const config = require("../../../config.json");
const GiveawayModel = require("../schemas/giveawaySchema");
const ScheduleModel = require("../../schedule/schemas/scheduleSchema");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");

async function endGiveaway(data) {
    const messageID = data.messageID;
    const channel = client.channels.cache.get(config.giveawayChannelID);
    const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
    if (!giveawayModel) {
        console.error("Couldn't find giveaway model in database")
    }

    // Disable entries by disabling button
    const message = await channel.messages.fetch(messageID);
    message.embeds[0].setColor(config.red);
    const row = ActionRowBuilder.from(message.components[0]);
    row.components[0].setDisabled(true);
    message.edit({ components: [row] });
    console.log("Disabled giveaway buttons")

    giveawayModel.open = false;
    const giveawayTask = async () => {
        await giveawayModel.save();
    };
    await client.giveawayQueue.enqueue(giveawayTask);
    console.log("Closed giveaway")

    // Calculate yield to give sponsor
    const totalTokens = [...giveawayModel.entries.values()].reduce(
        (sum, weight) => sum + weight,
        0
    );
    const yield = Math.floor(totalTokens / gconfig.percentYield);

    // Give sponsor tokens
    const userID = giveawayModel.sponsor;
    const inventoryModel = await UserInventoryModel.findOne({ userID }).exec();
    const inventoryTask = async () => {
        inventoryModel.numTokens += yield;
        await inventoryModel.save();
    };
    await client.inventoryQueue.enqueue(inventoryTask);

    if (yield > 0) {
        await channel.send(
            `Thank you <@${userID}> for sponsoring this giveaway! You've received **${yield} ${config.emojiToken} Tokens**!`
        );
    } else {
        await channel.send(
            `Thank you <@${userID}> for sponsoring this giveaway! Unfortunately, not enough people entered the giveaway so you received **${yield} ${config.emojiToken} Tokens**.`
        );
    }
    console.log("Gave sponsor tokens")

    // Get array of winners and convert to mentions
    const winnerArray = await rollWinner(giveawayModel, giveawayModel.winners);
    const addMentions = [...winnerArray.map((element) => `<@${element}>`)];
    const winnerMentions = addMentions.join(", ");

    await channel.send({
        content: `Congrats to ${winnerMentions}! 🎉`,
        embeds: [getWinnerEmbed(winnerMentions, giveawayModel.host, messageID)],
    });

    // Delete schedule
    const name = data.scheduleName;
    try {
        await ScheduleModel.deleteOne({ name }).exec();
        console.log(`Schedule deleted ${name}`);
    } catch (error) {
        console.error(`Error deleting schedule ${name}:`, error);
    }
}

module.exports = endGiveaway;
