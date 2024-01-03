const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

const token = config.emoji.token;

function getAnnouncementEmbed(total, inactive) {
    const summary =
        `**${total - inactive}** active players each paid their dues of **1 ${token}** to <@${config.clientID}>.\n` +
        `**${inactive}** inactive players had insufficient balance and were removed from <#${config.channelID.karutaMain}>.`;

    const embed = new EmbedBuilder()
        .setColor(config.embed.blue)
        .setTitle(`Active Players`)
        .setDescription(summary)
        .setFooter({
            text: `Yato collects dues weekly. Have a token to stay an active player!`,
        });
    return embed;
}

module.exports = getAnnouncementEmbed;
