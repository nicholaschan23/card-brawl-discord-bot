const { EmbedBuilder } = require("discord.js");

function getWinnerEmbed(bracketModel, setupModel) {
    const winner =
        bracketModel.completedMatches[bracketModel.completedMatches.length - 1].winner;
    const winnerUserID = setupModel.cards.get(winner).userID;

    const embed = new EmbedBuilder()
        .setTitle(`${setupModel.name} Winner`)
        .setDescription(
            `Size: **${setupModel.cards.size}** cards\n` +
                `Theme: **${setupModel.theme}**\n` +
                `Card: \`${winner}\` by <@${winnerUserID}>`
        )
        .setImage(`attachment://${winner}.png`);
    return embed;
}

module.exports = getWinnerEmbed;
