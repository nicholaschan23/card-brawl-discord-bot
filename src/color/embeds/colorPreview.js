const { EmbedBuilder } = require("discord.js");
const color = require("../color-config.json");
const config = require("../../../config.json");

function getPreviewEmbed() {
    const description = `Select a color using the dropdown menu below.`;

    let colors = `<@&${color.pink}>\n`;
    colors += `<@&${color.purple}>\n`;
    colors += `<@&${color.deepPurple}>\n`;
    colors += `<@&${color.indigo}>\n`;
    colors += `<@&${color.blue}>\n`;
    colors += `<@&${color.lightBlue}>\n`;
    colors += `<@&${color.cyan}>\n`;
    colors += `<@&${color.teal}>\n`;
    colors += `<@&${color.green}>`;

    const embed = new EmbedBuilder()
        .setTitle("Color Role")
        .setDescription(description + `\n\n**Options**:\n` + colors);
    return embed;
}

module.exports = getPreviewEmbed;
