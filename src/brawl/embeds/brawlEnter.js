const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getEnterEmbed(setupModel) {
    const theme = setupModel.theme;
    const series = setupModel.series;
    const sketch = setupModel.sketch;
    const size = setupModel.cards.size;
    const unixStartTime = setupModel.unixStartTime;

    let sketchText;
    switch (sketch) {
        case "prohibited": {
            sketchText = "\n🩸 Not Sketched";
            break;
        }
        case "optional": {
            sketchText = "\n🩸 Sketched";
            break;
        }
    }

    // Description
    const headers = `Size: **${size}** card${
        size === 1 ? "" : "s"
    } submitted\nTheme: **${theme}**\nSeries: **${series ?? "Any"}**\nDate: <t:${unixStartTime}:f>`;

    const requirements = `\n\n**Requirements**:${
        series ? "\n🏷️ Match series" : ""
    }\n🖼️ Framed\n🎨 Morphed${
        sketch === "prohibited" ? sketchText : ""
    }\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed${sketch === "optional" ? sketchText : ""}`;

    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`Enter Card Brawl`)
        .setDescription(headers + requirements);
    return embed;
}

module.exports = getEnterEmbed;
