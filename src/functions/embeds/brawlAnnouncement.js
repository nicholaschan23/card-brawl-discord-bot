const { EmbedBuilder } = require("discord.js");
const { getNextSaturday } = require("../../functions/createGuildEvent");
const config = require("../../../config.json");

function getAnnouncementEmbed(name, theme, size, competitors) {
    const times = getNextSaturday();
    const unixTimestampStart = Math.floor(times.start / 1000);

    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`${name}`)
        .setDescription(
            `Size: **${size}** cards\nStatus: **${size - competitors}/${size}** spots available\nTheme: **${theme}**\nDate: <t:${unixTimestampStart}:f>\n\n**Bonus Entries**:\n<@&${config.serverSubscriberRole}> **+1** entry\n\n**Bonus Votes**: *(Does not stack)*\n<@&${config.activeBoosterRole}> **+${config.activeBoosterBonus}** vote\n<@&${config.serverSubscriberRole}> **+${config.serverSubscriberBonus}** vote\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`
            // `Size: **${size}** cards\nStatus: **${size - competitors}/${size}** spots available\nTheme: **${theme}**\nDate: <t:${unixTimestampStart}:f>\n\n**Bonus Entries**: *(1x = 1 extra)*\n<@&${config.serverSubscriberRole}> **1x** entry\n\n**Bonus Votes**:\n<@&${config.serverBoosterRole}> **${config.serverBoosterBonus}x** vote\n<@&${config.activeBoosterRole}> **${config.activeBoosterBonus}x** votes\n<@&${config.serverSubscriberRole}> **${config.serverSubscriberBonus}x** votes\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`
        );
    return embed;
}

module.exports = { getAnnouncementEmbed };
