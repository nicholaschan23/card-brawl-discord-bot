const { EmbedBuilder } = require("discord.js");
const gconfig = require("../giveaway-config.json")
const config = require("../../../config.json");

function getGiveawayEmbed(giveawayModel) {
    const token = config.emojiToken;

    const headers = `Sponsor: <@${giveawayModel.sponsor}>\nHost: <@${giveawayModel.host}>\nWinners: **${giveawayModel.winners}**\nClosed: <t:${giveawayModel.unixEndTime}:R>`;
    const entries = `**Entry Limit**: *(1 entry is 1 ${token})*\n@everyone **${gconfig.everyoneCap}** entry\n<@&${config.serverBoosterRole}> **${gconfig.serverBoosterCap}** entries\n<@&${config.activeBoosterRole}> **${gconfig.activeBoosterCap}** entries\n<@&${config.serverSubscriberRole}> **${gconfig.serverSubscriberCap}** entries`;

    const embed = new EmbedBuilder()
        .setTitle(`${giveawayModel.prize}`)
        .setDescription(headers + "\n\n" + entries)
        .setFooter( {text: `Sponsors gain ${gconfig.percentYield}% of total Tokens entered!`})
    return embed;
}

module.exports = getGiveawayEmbed;
