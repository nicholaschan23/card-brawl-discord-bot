const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getAnnouncementEmbed(active, inactive) {
    const summary =
        `There are currently **${active}** active players!\n` +
        `**${inactive}** players have not dropped cards in a week and were marked as inactive.`;

    const embed = new EmbedBuilder()
        .setColor(config.embed.blue)
        .setTitle(`Active Players`)
        .setDescription(summary)
        .setFooter({
            text: `Yato removes inactive players weekly!`,
        });
    return embed;
}

module.exports = getAnnouncementEmbed;
