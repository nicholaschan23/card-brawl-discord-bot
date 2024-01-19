const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const config = require("../../../../config.json");

const section1 =
    `# Card Brawl\n` +
    `:boxing_glove: **Introducing Card Brawl, an exclusive feature to automatically coordinate card competition live events in a bracket-style format.** To participate, players can submit cards to compete and serve as judges to vote during the event in real-time.\n\n` +
    `The bot is in development. If you have any feedback or suggestions, please make a post in <#${config.channelID.brawlDiscussion}>.\n\n` +
    `Here are some of the features currently offered:\n` +
    `\`\`\`md\n` +
    `* Automated bracket generation, matchmaking, and vote calculation\n` +
    `* Real-time tournament management for community engagement\n` +
    `* Animated text sequences for added suspense during events\n` +
    `* Detailed user stats tracked during event participation\n` +
    `* Tournament progress and user stats are automatically saved, enabling resumption even in the event of a crash\n` +
    `* Automatic creates an entry in the event tab for the server\n` +
    `\`\`\``;

const section2 =
    `## Participate\n` +
    `:trophy: **Players can be competitors and judges for a Card Brawl.** Competitors submit cards to enter the tournament and judges vote on cards during the live event.\n\n` +
    `**Competitors**: Card competitions will be posted a week in advance for competitors to have time to style a card to enter. The competition will start the upcoming \`Saturday\`. Details about the requirements to enter will be posted in <#${config.channelID.brawlCompetitors}>. Use command \`/brawl enter\` to submit a card to the competition.\n\n` +
    `**Judges**: At the time of the event, card matchups will display in <#${config.channelID.brawlJudges}> according to the tournament bracket. Players can vote by pressing ":one:" or ":two:". This is repeated until there is a <@&${config.roleID.brawlChampion}>!\n\n` +
    `:question: Check out all the commands with the prefix \`/brawl\`! For additional help, visit <#${config.channelID.brawlDiscussion}>.`;

const section3 =
    `## Notifications\n` +
    `**Grab roles for event updates using the buttons below!**\n` +
    `<@&${config.roleID.brawlCompetitor}>: Get notified when to submit cards to compete.\n` +
    `<@&${config.roleID.brawlJudge}>: Get notified when the event goes live to vote.`;

const section4 =
    `## Support\n` +
    `:crown: **Become a <@&${config.roleID.serverSubscriber}> if you appreciate the work and effort put into this community and want to support and gain perks!** Hosting the bot online isn't free and it takes time to develop and maintain this unique community feature to bring to you.\n\n` +
    `Your incredible support truly makes a difference and helps fuel my passion for community building. While donations are never expected, your generosity and kindness enable me to continue doing what I love. Thank you for being a part of this amazing journey, continuing to make this something special.`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("brawl-info")
        .setDescription("Post Card Brawl info."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.channel.send({
            content: section1,
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: section2,
            allowedMentions: { parse: [] },
        });

        const competitorButton = new ButtonBuilder()
            .setCustomId("toggleBrawlCompetitor")
            .setLabel("Brawl Competitor")
            .setStyle(ButtonStyle.Primary);
        const judgeButton = new ButtonBuilder()
            .setCustomId("toggleBrawlJudge")
            .setLabel("Brawl Judge")
            .setStyle(ButtonStyle.Primary);
        const row3 = new ActionRowBuilder().addComponents(competitorButton, judgeButton);
        await interaction.channel.send({
            content: section3,
            allowedMentions: { parse: [] },
            components: [row3],
        });

        const supportButton = new ButtonBuilder()
            .setLabel("Server Subscriber")
            .setURL(config.serverShop)
            .setStyle(ButtonStyle.Link);
        const row4 = new ActionRowBuilder().addComponents(supportButton);
        await interaction.channel.send({
            content: section4,
            allowedMentions: { parse: [] },
            components: [row4],
        });

        await interaction.reply({ content: "Done!", ephemeral: true });
    },
};
