const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getEnterEmbed(setupModel) {
    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`Enter Card Brawl`)
        .setDescription(
            `Name: **${setupModel.name}**
            Status: **${setupModel.size - setupModel.cards.size}/${
                setupModel.size
            }** spots available
            Theme: ${setupModel.theme}
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

module.exports = { getEnterEmbed };
