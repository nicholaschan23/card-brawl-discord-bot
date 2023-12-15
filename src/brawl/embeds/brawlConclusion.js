const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getConclusionEmbed() {
    const embed = new EmbedBuilder()
        .setTitle(`Event Concluded`)
        .setDescription(
            `Thank you everyone for playing! I hope you enjoyed it and would love to see you again in future Card Brawls! Type \`/brawl stats\` to view your overall stats.🥊\n\n` +
                `**Notifications**:\n` +
                `Don't miss a Card Brawl community event by getting the below roles in <id:customize>.\n` +
                `<@&${config.roleID.brawlCompetitor}>: Get notified to submit cards to compete.\n` +
                `<@&${config.roleID.brawlJudge}>: Get notified when the event goes live.\n\n` +
                `**Feedback**:\n` +
                `Let us know if you enjoyed this event! Share any feedback or suggestions in <#1152351222456647780>.\n\n` +
                `**Support**:\n` +
                `Show your support to <@${config.developerID}> for developing and maintaining Card Brawl by becoming a <@&${config.roleID.serverSubscriber}>! Learn more at <#${config.channelID.brawlInfo}>.`
        );
    return embed;
}

module.exports = getConclusionEmbed;
