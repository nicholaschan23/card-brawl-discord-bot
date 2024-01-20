const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const perks =
    `## Levels\n` +
    `Server members are granted perks based on their server activity level. More info on levels in <#${config.channelID.features}>.\n` +
    `### Copper V (<@&${config.roleID.copper5}>)\n` +
    `- Toggle card collecting pings (\`/role bot\`)\n` +
    `### Bronze V (<@&${config.roleID.bronze5}>)\n` +
    `- Use external emojis\n` +
    `- Embed links (gifs)\n` +
    `- Change nickname\n` +
    `## Boosters\n` +
    `:heartpulse: **When you boost the server with Discord Nitro, you will gain both the <@&${config.roleID.activeBooster}> and <@&${config.roleID.serverBooster}> roles!** The <@&${config.roleID.serverBooster}> role is permanent, even if your boost runs out, to always grant you perks for supporting this server.\n` +
    `### Active Booster (<@&${config.roleID.activeBooster}>)\n` +
    `- **3x** bonus card giveaway entries\n` +
    `- **2x** bonus card brawl competition vote\n` +
    `- **80% XP boost** bonus for earning server levels\n` +
    `- Name atop member list when online\n` +
    `- Shoutout in <#${config.channelID.supporters}>\n` +
    `- View server insights (community growth, engagement, and more data)\n` +
    `### Server Booster (<@&${config.roleID.serverBooster}>)\n` +
    `- Use external stickers\n` +
    `- Use external emojis\n` +
    `- Embed links (gifs)\n` +
    `- Change nickname\n` +
    `### Subscriber (<@&${config.roleID.serverSubscriber}>)\n` +
    `- **3x** bonus ${config.emoji.token} earnings (more info on tokens in <#${config.channelID.cardInfo}>)\n` +
    `- **5x** bonus card giveaway entries\n` +
    `- **5x** bonus card brawl competition entries\n` +
    `- **2x** bonus card brawl competition vote\n` +
    `- Use external stickers\n` +
    `- Use external emojis\n` +
    `- Embed links (gifs)\n` +
    `- Change nickname\n`;

// Twitch
// If you sync your Twitch account with Discord, when you subscribe to @Irukanoko, you will get the @Twitch Subscriber role!
// Socials
// These platforms are a work in progress but I'll leave them here if you'd like to follow!
// Twitch: https://www.twitch.tv/Irukanoko
// Instagram: https://www.instagram.com/_irukanoko_/
// YouTube: https://www.youtube.com/@Irukanoko

// This server mainly grows via word of mouth so feel free to invite anyone who may be interested in enjoying this community!
// Discord: https://discord.gg/9vMKZcd`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("perks")
        .setDescription("Post perks."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.channel.send({
            content: perks,
            allowedMentions: { parse: [] },
        });
        await interaction.reply({ content: "Done!", ephemeral: true });
    },
};
