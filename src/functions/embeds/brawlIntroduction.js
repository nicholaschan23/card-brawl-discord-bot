const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getIntroductionEmbed(setupModel) {
    const embed = new EmbedBuilder()
        .setTitle(`Live Event`)
        .setDescription(
            `Welcome to the **${setupModel.name}** Card Brawl! There are a total of **${setupModel.size}** cards in this competition. Stick around to the end to see how it all unfolds! 🥊\n\n**Theme**:\nCast your votes for the cards you believe best fit the \`theme\`: __${setupModel.theme}__\n\n**How To Play**:\nFor each match, you have \`10 seconds\` to vote by reacting with "1️⃣", "2️⃣", or both! The card with more votes moves on to the next round. This repeats until a winner is decided.\n\nCheck the https://discord.com/channels/${config.guildID}/${config.announcementChannelID}/${setupModel.messageID} for info on unqiue bonuses.`
        );
    return embed;
}

module.exports = { getIntroductionEmbed };
