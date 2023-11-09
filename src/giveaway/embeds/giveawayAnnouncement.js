const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getGiveawayEmbed(giveawayModel, image) {
    const token = config.emojiToken;

    const headers = `Sponsor: <@${giveawayModel.sponsor}>\nHost: <@${giveawayModel.host}>\nWinners: **${giveawayModel.winners}**\nRequirement: **1 ${token} = 1 entry**\nEnds: <t:${giveawayModel.unixEndTime}:R>`;
    const entries = `**Entry Limit**:\n@everyone **${config.everyoneGiveawayCap}**\n<@&${config.serverBoosterRole}> **${config.serverBoosterGiveawayBonus}**\n<@&${config.activeBoosterRole}> **${config.activeBoosterGiveawayBonus}**\n<@&${config.serverSubscriberRole}> **${config.serverSubscriberGiveawayBonus}**`;
    const instructions = `**Earn Tokens**:\n**Every 5 drops, <@${config.clientID}> rewards you a ${token}!** Drop cards with any of these bots:\n- <@${config.karutaID}>\n- <@${config.sofiID}>\n- <@${config.tofuID}>\n- <@${config.gachaponID}>\nDrops will only count every 30 minutes. See <#1144103186974646402> for more details.`;

    const embed = new EmbedBuilder()
        .setTitle(`${giveawayModel.prize}`)
        .setDescription(headers + "\n\n" + entries + "\n\n" + instructions)
        .setImage(image);
    return embed;
}

module.exports = getGiveawayEmbed;
