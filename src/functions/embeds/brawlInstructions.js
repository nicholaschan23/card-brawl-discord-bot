const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getInstructionsEmbed() {
    const embed = new EmbedBuilder()
        .setTitle(`Instructions`)
        .setDescription(
            `Card Brawl automates hosting live bracket-style card competitions! To participate, players can compete and judge by submitting and voting on cards during the event.`
        )
        .addFields(
            {
                name: "Notifications:",
                value: `Get notified for Card Brawl community events by visiting <id:customize>.
                - <@&${config.competitorRole}>: notified when to submit cards to compete\n- <@&${config.judgeRole}>: notified when the event goes live to vote`,
            },
            {
                name: "Compete:",
                value: `Card Brawls will be posted in <#${config.announcementChannelID}> with requirements and details about joining the competition.`,
            },
            {
                name: "Judge:",
                value: `Card Brawl events will be in <#${config.arenaChannelID}>. Card matchups will be displayed and players can react to vote (1️⃣, 2️⃣). It's a live bracket-style tournament so stay to the end to determine the winner!`,
            }
        );
    return embed;
}

module.exports = { getInstructionsEmbed };
