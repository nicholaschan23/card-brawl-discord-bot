const { EmbedBuilder } = require("discord.js");

function getUserStatEmbed(userStatModel) {
    // Competitor stats
    const competitorStats = [
        `${userStatModel.cardsEntered}`,
        `${userStatModel.matchesCompeted}`,
        `${userStatModel.matchesWon}`,
        `${userStatModel.tiesLost}`,
        `${userStatModel.tiesWon}`,
        `${userStatModel.wins}`,
    ];
    const compeititorSuffix = [
        "Cards entered",
        "Matches competed",
        "Matches won",
        "Ties lost",
        "Ties won",
        "Tournament Wins",
    ];
    const competitorContent = alignTextToLongest(competitorStats, compeititorSuffix).join("\n");

    // Judge stats
    const judgeStats = [
        `${userStatModel.matchesJudged}`,
        `${userStatModel.votesGiven}`,
        `${userStatModel.votesReceived}`,
        `${userStatModel.votesHighest}`,
    ];
    const judgeSuffix = ["Matches judged", "Votes given", "Votes received", "Highest votes"];
    const judgeContent = alignTextToLongest(judgeStats, judgeSuffix).join("\n");

    const embed = new EmbedBuilder()
        .setTitle(`User Stats`)
        .setDescription(`Showing statistic for <@${userStatModel.userID}>`)
        .addFields(
            {
                name: "Competitor 🥊",
                value: competitorContent,
            },
            {
                name: "Judge 🪧",
                value: judgeContent,
            }
        );
    return embed;
}

function alignTextToLongest(strings, suffix) {
    // Find the length of the longest string
    const maxLength = strings.reduce((max, str) => Math.max(max, str.length), 0);

    // Pad each string with spaces to match the longest length at the front
    const alignedStrings = strings.map(
        (str, index) => "`" + str.padStart(maxLength, " ") + "` · " + suffix[index]
    );

    return alignedStrings;
}

module.exports = getUserStatEmbed;
