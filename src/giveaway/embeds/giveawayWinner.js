const { EmbedBuilder } = require("discord.js");
const { config } = require("../../index");

function getWinnerEmbed(winnerMentions, hostID, messageID, prize) {
    // Get message link to giveaway embed
    const messageLink = `https://discord.com/channels/${config.guildID}/${config.channelID.giveaway}/${messageID}`;

    const headers = `${winnerMentions} won the giveaway of [${prize}](${messageLink})!`;
    const instructions = `Contact <@${hostID}> within \`24 hours\` to claim your prize in <#${config.channelID.giveawayClaim}>. The winner will be rerolled otherwise.`;

    const embed = new EmbedBuilder()
        .setDescription(headers + "\n\n" + instructions)
        .setColor(config.embed.yellow);
    return embed;
}

module.exports = getWinnerEmbed;
