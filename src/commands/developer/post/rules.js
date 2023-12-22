const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const rulesContent =
    `# Rules\n` +
    `\`\`\`md\n` +
    `1. Be Respectful: Treat others kindly and with respect. No rude or harassing behavior.\n\n` +
    `2. No Spam or Self-Promotion: Avoid sending server invites, ads, or excessive pings. Don't DM members for promotion.\n\n` +
    `3. Keep it Clean: No explicit or disturbing content in text, images, or links.\n\n` +
    `4. Respectful Names & Avatars: Choose appropriate profile names and pictures. Anime avatars are encouraged.\n\n` +
    `5. No Begging: Avoid excessive begging.\n\n` +
    `6. Mind Profanity: Avoid excessive profanity.\n\n` +
    `7. Use Spoilers: When discussing spoilers, use text hiding ||spoiler text||.\n\n` +
    `8. No Lurking: Avoid excessive lurk-grabbing and add value to the community.\n` +
    `\`\`\`\n` +
    `We appreciate your kindness, maturity, and display of common sense.\n\n` +
    `For support, make a post in <#${config.channelID.serverSupport}>. For urgent server support, ping <@&${config.roleID.moderator}>. If you see someone breaking [Discord's guidelines](https://discord.com/guidelines), right click the user's message and report them.`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("rules")
        .setDescription("Post rules."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.channel.send({
            content: rulesContent,
            allowedMentions: { parse: [] },
        });
        await interaction.reply({ content: "Done!", ephemeral: true });
    },
};
