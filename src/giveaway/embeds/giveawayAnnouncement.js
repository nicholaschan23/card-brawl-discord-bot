const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getGiveawayEmbed(giveawayModel, image) {
    const token = config.emojiToken;

    const headers = `Sponsor: <@${giveawayModel.sponsor}>\nHost: <@${giveawayModel.host}>\nWinners: **${giveawayModel.winners}**\nRequirement: **1 ${token} = 1 entry**\nEnds: <t:${giveawayModel.unixEndTime}:R>`;
    const entries = `**Entry Limit**:\n@everyone **${config.everyoneGiveawayCap}** entry\n<@&${config.serverBoosterRole}> **${config.serverBoosterGiveawayBonus}** entries\n<@&${config.activeBoosterRole}> **${config.activeBoosterGiveawayBonus}** entries\n<@&${config.serverSubscriberRole}> **${config.serverSubscriberGiveawayBonus}** entries`;

    const embed = new EmbedBuilder()
        .setTitle(`${giveawayModel.prize}`)
        .setDescription(headers + "\n\n" + entries)
        .setImage(image);
    return embed;
}

module.exports = getGiveawayEmbed;
