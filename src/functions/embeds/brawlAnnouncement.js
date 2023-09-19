const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getAnnouncementEmbed(name, theme, size, hostID) {
    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`${name} Card Brawl`)
        .setDescription(
            `Name: **${name}**
            Size: **${size}** cards
            Theme: ${theme}
            Host: <@${hostID}>

            **Extra Entries:** *(1x = 1 extra)*
            <@&1153438579821903974> **1x** entry

            **Extra Votes:** 
            <@&814708993393426482> **1x** vote
            <@&776543515735883828> **3x** vote
            <@&1153438579821903974> **5x** votes
            `
        )
        .addFields(
            {
                name: "Requirements:",
                value: `🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched`,
                inline: true,
            },
            {
                name: "Optional:",
                value: `💧 Dyed\n✂️ Trimmed`,
                inline: true,
            }
        );
    return embed;
}

module.exports = { getAnnouncementEmbed };
