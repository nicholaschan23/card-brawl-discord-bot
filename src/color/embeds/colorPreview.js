const { EmbedBuilder } = require("discord.js");
const color = require("../color-config.json");

const colors = `<@&${color.orange}>\n<@&${color.deepOrange}>\n<@&${color.red}>\n<@&${color.pink}>\n<@&${color.purple}>\n<@&${color.deepPurple}>\n<@&${color.indigo}>\n<@&${color.blue}>\n<@&${color.lightBlue}>\n<@&${color.cyan}>\n<@&${color.teal}>\n<@&${color.green}>`;
const neonColors = `<@&${color.neonOrange}>\n<@&${color.neonDeepOrange}>\n<@&${color.neonRed}>\n<@&${color.neonPink}>\n<@&${color.neonPurple}>\n<@&${color.neonDeepPurple}>\n<@&${color.neonIndigo}>\n<@&${color.neonBlue}>\n<@&${color.neonLightBlue}>\n<@&${color.neonCyan}>\n<@&${color.neonTeal}>\n<@&${color.neonGreen}>`;

function getPreviewEmbed() {
    const embed = new EmbedBuilder()
        .setTitle("Color Role")
        .setDescription("Select a color using the dropdown menu below.")
        .addFields({ name: `Regular`, value: colors, inline: true }, { name: "Neon", value: neonColors, inline: true });
    return embed;
}

module.exports = getPreviewEmbed;
