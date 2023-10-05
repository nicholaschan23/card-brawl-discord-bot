const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getWinnerEmbed(bracketModel, setupModel) {
    const winner =
        bracketModel.completedMatches[bracketModel.completedMatches.length - 1]
            .winner;
    const winnerUserID = setupModel.cards.get(winner).userID;

    const embed = new EmbedBuilder()
        .setTitle(`${setupModel.name} Winner`)
        .setDescription(`Size: **${setupModel.size}** cards\nTheme: **${setupModel.theme}**\nCard: \`${winner}\` by <@${winnerUserID}>`)
        .setImage(setupModel.cards.get(winner).imageLink)
    return embed;
}

module.exports = { getWinnerEmbed };
