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
                question: `What is a ${token}?`,
                answer: `${token} are Tokens, a currency to interact with various exclusive features in the Far Shore community.`,
            },
            {
                question: `How do you earn ${token}?`,
                answer: `Every 5 drops rewards you a ${token}! Drop cards with any of these bots:\n- <@${config.karutaID}>\n- <@${config.sofiID}>\n- <@${config.tofuID}>\n- <@${config.gachaponID}>\nDrops will only count every 30 minutes. See <#1144103186974646402> for more details on how to drop.`,
            },
        ];

        const formatedQA = QA.map((item) => `**Q**: **${item.question}**\n**A**: ${item.answer}`).join(
            "\n\n"
        );

        const embed = new EmbedBuilder().setTitle("Token Q&A").setDescription(formatedQA);
        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
