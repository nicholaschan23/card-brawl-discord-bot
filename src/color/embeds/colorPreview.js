const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

const colors =
    `<@&${config.roleID.red}>\n` +
    `<@&${config.roleID.pink}>\n` +
    `<@&${config.roleID.purple}>\n` +
    `<@&${config.roleID.deepPurple}>\n` +
    `<@&${config.roleID.indigo}>\n` +
    `<@&${config.roleID.blue}>\n` +
    `<@&${config.roleID.lightBlue}>\n` +
    `<@&${config.roleID.cyan}>\n` +
    `<@&${config.roleID.teal}>\n` +
    `<@&${config.roleID.green}>`;
const neonColors =
    `<@&${config.roleID.neonRed}>\n` +
    `<@&${config.roleID.neonPink}>\n` +
    `<@&${config.roleID.neonPurple}>\n` +
    `<@&${config.roleID.neonDeepPurple}>\n` +
    `<@&${config.roleID.neonIndigo}>\n` +
    `<@&${config.roleID.neonBlue}>\n` +
    `<@&${config.roleID.neonLightBlue}>\n` +
    `<@&${config.roleID.neonCyan}>\n` +
    `<@&${config.roleID.neonTeal}>\n` +
    `<@&${config.roleID.neonGreen}>`;

function getPreviewEmbed() {
    const embed = new EmbedBuilder()
        .setTitle("Color Role")
        .setDescription("Select a color using the dropdown menu below.")
        .addFields(
            {
                name: `${config.color.cost} ${config.emoji.token}`,
                value: colors,
                inline: true,
            },
            {
                name: `${config.color.neonCost} ${config.emoji.token}`,
                value: neonColors,
                inline: true,
            }
        );
    return embed;
}

module.exports = getPreviewEmbed;
