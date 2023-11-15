const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getWinnerEmbed(winnerMentions, hostID, messageID, prize) {
    // Get message link to giveaway embed
    const messageLink = `https://discord.com/channels/${config.guildID}/${config.giveawayChannelID}/${messageID}`;

    const headers = `${winnerMentions} won the giveaway of [${prize}](${messageLink})!`;
    const instructions = `Contact <@${hostID}> within \`24 hours\` to claim your prize in <#${config.giveawayClaimChannelID}>. The winner will be rerolled otherwise.`;
    const embed = new EmbedBuilder()
        .setDescription(headers + "\n\n" + instructions)
        .setColor(config.yellow);
    return embed;
}

module.exports = getWinnerEmbed;
