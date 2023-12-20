const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

function getRulesEmbeds() {
    const embed = new EmbedBuilder()
        .setTitle(`Rules`)
        .setDescription(
            `We appreciate your kindness, maturity, and display of common sense.\n` +
                `\`\`\`md\n` +
                `1. Be Respectful: Treat others kindly and with respect. No rude or harassing behavior.\n` +
                `2. No Spam or Self-Promotion: Avoid sending server invites, ads, or excessive pings. Don't DM members for promotion.\n` +
                `3. Keep it Clean: No explicit or disturbing content in text, images, or links.\n` +
                `4. Respectful Names & Avatars: Choose appropriate profile names and pictures. Anime avatars are encouraged.\n` +
                `5. No Begging: Avoid excessive begging.\n` +
                `6. Mind Profanity: Avoid excessive profanity.\n` +
                `7. Use Spoilers: When discussing spoilers, use text hiding ||spoiler text||.\n` +
                `8. No Lurking: Avoid excessive lurk-grabbing and add value to the community.\n` +
                `\`\`\`\n` +
                `For support, make a post in <#${config.channelID.serverSupport}>. For urgent server support, ping <@&${config.roleID.moderator}>. If you see someone breaking [Discord's guidelines](https://discord.com/guidelines), right click the user's message and report them.`
        );
    return embed;
}

module.exports = getRulesEmbeds;
