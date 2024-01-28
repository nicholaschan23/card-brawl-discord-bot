const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getAnnouncementEmbed(active, inactive) {
    const summary =
        `**${active}** active players\n` +
        `**${inactive}** inactive players\n\n` +
        `:confetti_ball: **Active players get exclusive access to <#${config.channelID.karutaMain}>!** Earn a ${config.emoji.token} to be an <@&${config.roleID.activePlayer}>. If a player hasn't dropped cards in a week, they will be marked as inactive.`;

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
