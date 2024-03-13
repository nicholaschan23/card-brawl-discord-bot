const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

const QA = [
    {
        question: `What are tokens?`,
        answer: `Tokens are Far Shore's exclusive form of currency earned through community engagement!`,
    },
    {
        question: `How do you earn tokens?`,
        answer:
            `There are various ways to earn tokens.\n` +
            ` 1. Every 5 drops rewards you a ${config.emoji.token}! Drops count every 30 minutes between any of the bots below. See <#1144103186974646402> for details.\n` +
            ` - <@${config.botID.karuta}>\n` +
            ` - <@${config.botID.sofi}>\n` +
            ` - <@${config.botID.tofu}>\n` +
            ` - <@${config.botID.gachapon}>` +
            `\n- Sponsoring giveaways earns you 10% of total ${config.emoji.token} entered! The more appealing the giveaway, the more participants, the more tokens.`,
    },
    {
        question: `What can I spend tokens on?`,
        answer:
            `Below is a list of available options.\n` +
            `- Giveaways (<#${config.channelID.giveaway}>)\n` +
            `- Brawl entries (<#${config.channelID.brawlCompetitors}>)\n` +
            `- Role color (\`/role color\`)`,
    },
];

function getTokenHelpEmbed() {
    const formattedQA = QA.map(
        (item) => `**Q**: **${item.question}**\n**A**: ${item.answer}`
    ).join("\n\n");

    const embed = new EmbedBuilder().setTitle("Token Q&A").setDescription(formattedQA);
    return embed;
}

module.exports = getTokenHelpEmbed;
