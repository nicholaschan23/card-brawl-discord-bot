const { ActionRowBuilder } = require("discord.js");
const rollWinner = require("../src/rollWinner");
const client = require("../../index");
const config = require("../../../config.json");
const UserInventoryModel = require("../../inventory/schema/userInventorySchema");
const GiveawayModel = require("../schemas/giveawaySchema");

async function endGiveaway(data) {
    const messageID = data.messageID;
    const channel = client.channels.cache.get(config.giveawayChannelID);
    const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();

    // Disable entries by disabling button
    const message = channel.messages.fetch(messageID);
    const row = ActionRowBuilder.from(message.components[0]);
    row.components[0].setDisabled(true);
    message.edit({ components: [row] });

    giveawayModel.open = false;
    const task = () => {
        giveawayModel.save();
    };
    client.giveawayQueue.enqueue(task);

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
        console.log(`[SEND REMINDER] ${name} schedule deleted`);
    } catch (error) {
        console.error(`[SEND REMINDER] Error deleting schedule ${name}:`, error);
    }
}

module.exports = endGiveaway;
