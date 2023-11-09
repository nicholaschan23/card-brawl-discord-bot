const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getEnterEmbed(setupModel) {
    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`Enter Card Brawl`)
        .setDescription(
            `Name: **${setupModel.name}**\nSize: **${setupModel.cards.size}** cards submitted\nTheme: **${setupModel.theme}**\nSeries: **${setupModel.series ?? "Any"}**\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`
        );
    return embed;
}

module.exports = getEnterEmbed;
