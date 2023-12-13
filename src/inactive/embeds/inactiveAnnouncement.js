const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

const token = config.emoji.token;

function getAnnouncementEmbed(total, inactive) {
    const active = total - inactive;

    const summary =
        `**Summary**\n` +
        `**${active}** active players gave **1 ${token}** to <@${config.clientID}>.\n` +
        `**${inactive}** inactive players had insufficient balance and were removed from <#${config.channelID.karutaMain}>. Earn a ${token} to gain back access!`;

    const embed = new EmbedBuilder()
        .setColor(config.embed.blue)
        .setTitle(`Active Players`)
        .setDescription(summary)
        .setFooter({
            text: `Yato comes by weekly. Have a token to stay an active player!`,
        });
    return embed;
}

module.exports = getAnnouncementEmbed;
