const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const cardAdsIntro =
    `# Card Ads\n` +
    `:folding_hand_fan: **Introducing Card Ads, an exclusive feature for players to effortlessly find and list cards for trade, maximizing fast sales at the best prices!** Each player posts trading ads differently, often reposting the same ad without updating it when a card is sold. This results in a lack of standardized formatting, clutter, and outdated listings, making it challenging to search for specific cards.\n` +
    `\n` +
    `Here are some of the features currently offered:\n` +
    `\`\`\`md\n` +
    `* View card stats in a single post, eliminating the hassle of manually looking them up\n` +
    `* Ensure all posts are active card listings, avoiding any confusion with outdated ones\n` +
    `* Find cards easily with formatted titles (<Edition> <Print> <Character>)\n` +
    `* Receive formatted card offers, instead of players just sending you card codes and having to manually look them up\n` +
    `* Automatically prevents duplicate listings to have no clutter\n` +
    `* Collect offers more conveniently without relying on direct messages (DMs)\n` +
    `* Visually see the card being sold, rather than relying on text\n` +
    `\`\`\``;

const listCards =
    `## List Cards (<#${config.channelID.cardAds}>)\n` +
    `:flags: **To list cards for trade, use the command \`/card sell\`!** Once your listing is no longer available, use \`/card sold\` to remove it. Please note that unsold listings will be automatically deleted after __1 week__ to ensure a fresh market, but you can always repost your cards.\n` +
    `-  \`/card sell\` to list your cards for trade\n` +
    `- \`/card sold\` to delete your listing`;

const sendOffers =
    `## Send Offers (<#${config.channelID.cardOffers}>)\n ` +
    `:dolls: **To send offers for cards, use the command \`/card offer\`!** You can search for specific cards using message titles by pressing \`CTRL+F\` (i.e. E6 MP Yato). Once an offer is posted, it cannot be retracted or edited, but you're welcome to make multiple offers for a single card.\n` +
    `- \`/card offer\` to send an offer`;

const gettingStarted =
    `# Getting Started\n` +
    `Use any of the trade channels (<#${config.channelID.trade1}>) to run the commands in the following sections.\n` +
    `\n` +
    `${listCards}\n` +
    `\n` +
    `${sendOffers}`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("market-info")
        .setDescription("Post market info.")
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("What message do you want to post? (Default: All)")
                .addChoices(
                    { name: "Ads", value: `Ads` },
                    { name: "Offers", value: `Offers` }
                )
                .setRequired(false)
        ),
    category: "developer/post",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const message = interaction.options.getString("message");

        if (message === "Ads") {
            await interaction.channel.send({
                content: listCards,
            });
        } else if (message === "Offers") {
            await interaction.channel.send({
                content: sendOffers,
            });
        } else {
            await interaction.channel.send({
                content: cardAdsIntro,
                allowedMentions: { parse: [] },
            });
            await interaction.channel.send({
                content: gettingStarted,
                allowedMentions: { parse: [] },
            });
        }
        await interaction.editReply({ content: "Done!", ephemeral: true });
    },
};
