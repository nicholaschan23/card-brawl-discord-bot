const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getGiveawayEmbed(giveawayModel, type) {
    const token = config.emoji.token;

    const headers =
        `Type: **${type}**` +
        `Sponsor: <@${giveawayModel.sponsor}>\n` +
        `Host: <@${giveawayModel.host}>\n` +
        `Winners: **${giveawayModel.winners}**\n` +
        `Closed: <t:${giveawayModel.unixEndTime}:R>`;
    const entries =
        `**Entry Limit**: *(1 entry is 1 ${token})*\n` +
        `@everyone **${config.giveaway.everyoneCap}** entry\n` +
        `<@&${config.roleID.serverBooster}> **${config.giveaway.serverBoosterCap}** entries\n` +
        `<@&${config.roleID.activeBooster}> **${config.giveaway.activeBoosterCap}** entries\n` +
        `<@&${config.roleID.serverSubscriber}> **${config.giveaway.serverSubscriberCap}** entries`;

    const embed = new EmbedBuilder()
        .setTitle(`${giveawayModel.prize}`)
        .setDescription(headers + "\n\n" + entries)
        .setFooter({
            text: `Sponsors gain ${config.giveaway.percentYield}% of total Tokens entered!`,
        });
    return embed;
}

module.exports = getGiveawayEmbed;
