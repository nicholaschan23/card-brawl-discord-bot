const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getEnterEmbed(setupModel) {
    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`Enter Card Brawl`)
        .setDescription(
            `Name: **${setupModel.name}**\nStatus: **${
                setupModel.size - setupModel.cards.size
            }/${setupModel.size}** spots available\nTheme: **${
                setupModel.theme
            }**\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`
        );
    return embed;
}

module.exports = { getEnterEmbed };
