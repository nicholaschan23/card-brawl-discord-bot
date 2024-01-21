const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const gettingStarted =
    `# Getting Started\n` +
    `:game_die: **There are several card collecting games you can play: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>!** There are designated channels to drop (get), trade, organize, style, and show off cards. There are also other bots that provide complimentary features to these games like drop analysis, auto card pricing, dye/frame testing, and more.\n\n` +
    `:question: For any additional help, ask in <#${config.channelID.cardDiscussion}>.\n` +
    `## Drop\n` +
    `**${config.emoji.token} Earn tokens when dropping cards to spend on the server!** More info on tokens in \`/help\`. The channels are named appropriately so you can remember what to type to drop cards.\n` +
    `- In <#${config.channelID.karutaDrop}> type \`kd\` and pick a number (\`khelp\` for all commands)\n` +
    `- In <#${config.channelID.sofiDrop}> type \`sd\` and pick a number (\`shelp\` for all commands)\n` +
    `- In <#${config.channelID.tofuSummon}> type \`ts\` and pick a number (\`thelp\` for all commands)\n` +
    `- In <#${config.channelID.gachaponDrop}> type \`gg\` and pick a number (\`ghelp\` for all commands)\n` +
    `## Trade\n` +
    `- Post trading ads in <#${config.channelID.tradingAds}>\n` +
    `- Conduct trades in any of the <#${config.channelID.card1}> channels\n` +
    `## Organize\n` +
    `- Organize your card collection in any of the <#${config.channelID.card1}> channels\n` +
    `## Style\n` +
    `- Post styling service ads in <#${config.channelID.serviceAds}>\n` +
    `- Conduct services in any of the <#${config.channelID.style1}> channels\n` +
    `## Show off\n` +
    `- Show off cards in <#${config.channelID.cardGallery}>\n` +
    `- Compete in card competitions (more info in <#${config.channelID.brawlInfo}>)\n`;

const lurking =
    `# No Lurking\n` +
    `### Excessive lurk grabbing will result in mutes and or bans.\n` +
    `- __Example of excessive lurk grabbing__: You're a member of the server for several months, 0-10 messages, and have grabbed high wishlist value or very expensive cards from server drop fights.\n` +
    `- __How to avoid an excessive lurk ban__: You don't have to do a lot. At least react when you grab something good, drop cards, or chat every so often. *If you're active in the community, you don't have to worry and can happily ignore this rule!*\n` +
    `- __Why this is a rule__: We want to promote an active community, and in doing so reward the members who are contributing to the server. If you're not contributing anything yourself, you're actively taking away from those who make this server what it is. Thank you for understanding.`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("card-info")
        .setDescription("Post card info."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.channel.send({
            content: gettingStarted,
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: lurking,
            allowedMentions: { parse: [] },
        });
        await interaction.reply({ content: "Done!", ephemeral: true });
    },
};
