const { SlashCommandSubcommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../../config.json");
const token = config.emojiToken;

module.exports = {
    category: "public/help",
    data: new SlashCommandSubcommandBuilder()
        .setName("token")
        .setDescription(`Information on Tokens.`),
    async execute(interaction) {
        const QA = [
            {
                question: `What are tokens?`,
                answer: `Tokens are Far Shore's exclusive form of currency. Spend them to elevate your presence in the community, unlocking visual flair, event bonuses, and more!`,
            },
            {
                question: `How do you earn tokens?`,
                answer: `Tokens are earned through community engagement.\n 1. Every 5 drops rewards you a ${token}! Drops count every 30 minutes and can be from any of the bots below. See <#1144103186974646402> for details.\n - <@${config.karutaID}>\n - <@${config.sofiID}>\n - <@${config.tofuID}>\n - <@${config.gachaponID}>`,
            },
            {
                question: `What can I spend tokens on?`,
                answer: `Currently, the available options to spend tokens on are listed below. More features coming soon!\n- Role color (Use command \`/role color\`)`,
            },
        ];

        const formatedQA = QA.map((item) => `**Q**: **${item.question}**\n**A**: ${item.answer}`).join(
            "\n\n"
        );

        const embed = new EmbedBuilder().setTitle("Token Q&A").setDescription(formatedQA);
        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
