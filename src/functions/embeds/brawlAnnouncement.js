const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getAnnouncementEmbed(name, theme, size, hostID) {
    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`${name}`)
        .setDescription(
            `Size: **${size}** cards\nTheme: ${theme}\nHost: <@${hostID}>\n\n**Bonus Entries**: *(1x = 1 extra)*\n<@&${config.serverSubscriberRole}> **1x** entry\n\n**Bonus Votes**:\n<@&${config.serverBoosterRole}> **${config.serverBoosterBonus}x** vote\n<@&${config.activeBoosterRole}> **${config.activeBoosterBonus}x** vote\n<@&${config.serverSubscriberRole}> **${config.serverSubscriberBonus}x** votes\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`
        );
    return embed;
}

module.exports = { getAnnouncementEmbed };
