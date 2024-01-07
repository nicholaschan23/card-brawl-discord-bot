const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getConclusionEmbed() {
    const embed = new EmbedBuilder()
        .setTitle(`Event Concluded`)
        .setDescription(
            `Thank you everyone for playing! I hope you enjoyed it and would love to see you again in future Card Brawls! 🥊\n\n` +
                `**Notifications**:\n` +
                `Don't miss a Card Brawl by grabbing the roles below.\n` +
                `<@&${config.roleID.brawlCompetitor}>: Get notified to submit cards to compete.\n` +
                `<@&${config.roleID.brawlJudge}>: Get notified when the event goes live.\n\n` +
                `**Feedback**:\n` +
                `Let us know if you enjoyed this event! Share any feedback or suggestions in <#1152351222456647780>.\n\n` +
                `**Support**:\n` +
                `Countless hours have been dedicated to crafting this experience for you. Show your support to <@${config.developerID}> for developing and maintaining Card Brawl by becoming a <@&${config.roleID.serverSubscriber}>!`
        );
    return embed;
}

module.exports = getConclusionEmbed;
