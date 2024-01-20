const { SlashCommandSubcommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../../../config.json");

const introduction =
    `# Introduction\n` +
    `:shinto_shrine: **Welcome to the Far Shore, a Noragami-themed anime & gaming community!** Our members enjoy various card collecting games such as: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>. Our server has a custom bot, <@${config.clientID}> that integrates with these games to enhances the gameplay and use of their collectibles.\n\n` +
    `To get started, find channels with a :pushpin: in the name and it'll walk you through what to do and how things work in our server. Reminder, you can customize what channels are visible to you by visiting <id:browse>. We hope you like our attention to detail, friendly culture, and organization throughout the server. Enjoy your stay!`;

const roles =
    `# Server Features\n` +
    `## Unique Roles\n` +
    `Customize your presence in <id:customize> to let the community know a little bit about who you are!` +
    `\`\`\`md\n` +
    `1. What anime/manga genres do you like?\n` +
    `2. What anime/manga personality type would you be?\n` +
    `3. What is your age\n` +
    `4. What are your pronouns?\n` +
    `5. What video games do you play/follow?\n` +
    `6. What is your Myers-Briggs personality type?\n` +
    `\`\`\`\n`;

const stickers =
    `## 60 Noragami Stickers\n` +
    `Enjoy exclusive Noragami stickers just by being a part of this server! All stickers are hand-picked from the show and edited by <@${config.developerID}>.\n` +
    `- Anyone can use these stickers in this server, even if you don't have Discord Nitro\n` +
    `- Anyone who has Discord Nitro can use these stickers anywhere on Discord\n`;

const levels =
    `## Server Activity Levels\n` +
    `:medal: **Earn XP levels by chatting!** When you have enough XP to reach a new rank, you will be notified in <#${config.channelID.levels}> and unlock <#${config.channelID.perks}>. Each rank also comes with a role icon which is displayed next to your name to show off in chat. Use \`/level\` in <#${config.channelID.bot}> to see your progress.`;

const ranksEmbed = new EmbedBuilder().setTitle("Ranks").addFields(
    {
        name: `Copper`,
        value:
            `- Level 5: <@&${config.roleID.copper5}>\n` +
            `- Level 10: <@&${config.roleID.copper4}>\n` +
            `- Level 15: <@&${config.roleID.copper3}>\n` +
            `- Level 20: <@&${config.roleID.copper2}>\n` +
            `- Level 25: <@&${config.roleID.copper1}>`,
        inline: true,
    },
    {
        name: `${config.emoji.bronze} Bronze`,
        value:
            `- Level 30: <@&${config.roleID.bronze5}>\n` +
            `- Level 35: <@&${config.roleID.bronze4}>\n` +
            `- Level 40: <@&${config.roleID.bronze3}>\n` +
            `- Level 45: <@&${config.roleID.bronze2}>\n` +
            `- Level 50: <@&${config.roleID.bronze1}>`,
        inline: true,
    },
    {
        name: `${config.emoji.silver} Silver`,
        value:
            `- Level 55: <@&${config.roleID.silver5}>\n` +
            `- Level 60: <@&${config.roleID.silver4}>\n` +
            `- Level 65: <@&${config.roleID.silver3}>\n` +
            `- Level 70: <@&${config.roleID.silver2}>\n` +
            `- Level 75: <@&${config.roleID.silver1}>`,
        inline: true,
    },
    {
        name: `${config.emoji.gold} Gold`,
        value:
            `- Level 80: <@&${config.roleID.gold3}>\n` +
            `- Level 90: <@&${config.roleID.gold2}>\n` +
            `- Level 100: <@&${config.roleID.gold1}>`,
        inline: true,
    },
    {
        name: `${config.emoji.platinum} Platinum`,
        value:
            `- Level 110: <@&${config.roleID.platinum3}>\n` +
            `- Level 120: <@&${config.roleID.platinum2}>\n` +
            `- Level 130: <@&${config.roleID.platinum1}>`,
        inline: true,
    },
    {
        name: `${config.emoji.diamond} Diamond`,
        value: `- Level 150: <@&${config.roleID.diamond}>`,
        inline: true,
    },
    {
        name: `${config.emoji.champion} Champion`,
        value: `- Level 200: <@&${config.roleID.champion}>`,
        inline: true,
    }
);

const customVoice =
    `## Customizable Voice Calls\n` +
    `:headphones: **Use Discord Nitro stream and audio quality without having Discord Nitro!** The server receives perks based on our number of <@&${config.roleID.activeBooster}> so community members who don't have Nitro can still enjoy high quality voice calls.\n\n` +
    `Join a "create" voice channel (i.e. <#1158256647244890153>) to create your own custom voice call. Customize the voice call using the commands below with <@${config.botID.partybeast}>.`;

const voiceEmbed = new EmbedBuilder().setTitle("Commands").addFields(
    {
        name: `Size`,
        value: `\`/limit\` sets the user limit in your voice call`,
        inline: true,
    },
    {
        name: `Privacy`,
        value:
            `:lock: \`/lock\` locks your voice call so others can't join\n` +
            `:incoming_envelope: \`/invite\` invites a user to your locked voice call`,
        inline: true,
    },
    {
        name: `Moderate`,
        value:
            `\`/kick\` kicks a user from your voice call\n` +
            `\`/ban\` bans a user from your voice call\n` +
            `\`/owner\` sets a new owner for the voice call`,
        inline: true,
    }
);

const invite =
    `# Invite\n` +
    `:crown: **Feel free to invite friends who may be interested in enjoying this community!** The server grows through word of mouth to keep it exclusive. Thank you for making the community even more enjoyable.\n\n` +
    `https://discord.gg/farshore`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("features")
        .setDescription("Post features."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        await interaction.channel.send({
            content: introduction,
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: roles,
            allowedMentions: { parse: [] },
        });

        const sticker = await interaction.guild.stickers
            .fetch()
            .then((stickers) => stickers.find((sticker) => sticker.name === "No Way"));
        await interaction.channel.send({
            content: stickers,
            stickers: [sticker],
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: levels,
            embeds: [ranksEmbed],
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: customVoice,
            embeds: [voiceEmbed],
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: invite,
            allowedMentions: { parse: [] },
        });

        await interaction.editReply({ content: "Done!" });
    },
};
