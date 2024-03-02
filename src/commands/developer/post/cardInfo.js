const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const config = require("../../../../config.json");

// ## Bots
// ### Karuta
// @Karuta#1280 Main card bot
// - 4 card server drops `kchest`
// ### Starflight
// @Starflight#8533 Utility bot
// __Regular__
// - Pings <@&1143587516373549186> when there's a server drop
// - Pings <@&1143587614788702238> when there's a card dropping from someone's wishlist (`kww` to set your wishlist watch channel in #《🥢》karuta-drop)
// - Pings @Brawl Judge when there's an event drop
// - Add cards to your Starflight wishlist `sf.wa` (second wishlist in addition to Karuta's)
// - Set your Starflight wishwatch channel `sf.ww`
// - `kci` and react with :moneybag: for card pricer
// __Premium__
// - Check premium status `sf.premium`
// - Provide information about cards in a drop with `wishlist >= 5` in #《🥢》karuta-drop
// - Auto stars high wishlist cards with `wishlist >= 100` and posts in #《⭐》best-drops
// - Test dyes, cards, and frames __you don't own__ `sf.dye <dye code>`
// ### Koibot
// @Koibot#0054 Date solver bot
// - Check premium status `/wls` and `/swls`
// - `kvi`
// - `ssolve [insert image url]`
// ### Keqing
// @Keqing#9910 Effort calculator bot
// - `kwi` and react with :1234: to get effort analysis
// ### Kalendar
// @Kalendar#5027 Collection utility bot
// - `kc` and react with :calendar: or :calendar_spiral: to automatically copy card codes
// - `kbi` and react with :pencil: or :money_with_wings: to get bit totals
// - `kci` and react with :calendar: to find Koibito
// ### Queen's Right Leg (QRL)
// @Queen's Right Leg#7475 Utility bot [Documentation](https://docs.leg.ryansbakery.dev/)
// - Solves `kdaily`

const gettingStarted =
    `# Getting Started\n` +
    `:game_die: **There are several card collecting games you can play: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>!** There are designated channels to drop (get), trade, organize, style, and show off cards. There are also other bots that provide complimentary features to these games like drop analysis, auto card pricing, dye/frame testing, and more.\n\n` +
    `:question: For any additional help, ask in <#${config.channelID.cardDiscussion}>.\n` +
    `## Drop\n` +
    `**${config.emoji.token} Earn tokens when dropping cards to spend on the server!** More info on tokens in \`/help\`. The channels are named appropriately so you can remember what to type to drop cards.\n` +
    `- In <#${config.channelID.karutaDrop}> type \`kd\` and pick a number (\`khelp\` for all commands)\n` +
    `- In <#${config.channelID.sofiDrop}> type \`sd\` and pick a number (\`shelp\` for all commands)\n` +
    `- In <#${config.channelID.tofuSummon}> type \`ts\` and pick a number (\`thelp\` for all commands)\n` +
    `- In <#${config.channelID.gachaponDrop}> type \`gg\` and pick a number (\`ghelp\` for all commands)`;

const pings =
    `# Notifications\n` +
    `Use the buttons below to toggle notifications of certain card drops! Each row corresponds to a different bot.`;

const activePlayer =
    `# Active Player\n` +
    `:confetti_ball: **Active players get exclusive access to <#${config.channelID.karutaMain}>!** Earn a ${config.emoji.token} to be an <@&${config.roleID.activePlayer}>. If a player hasn't dropped cards in a week, the role will be removed.`;

const lurking =
    `# No Lurking\n` +
    `### Excessive lurk grabbing will result in mutes and or bans.\n` +
    `- __Example of excessive lurk grabbing__: You're a member of the server for several months, 0-10 messages, and have grabbed high wishlist value or very expensive cards from server drop fights.\n` +
    `- __How to avoid an excessive lurk ban__: You don't have to do a lot. At least react when you grab something good, drop cards, or chat every so often. *If you're active in the community, you don't have to worry and can happily ignore this rule!*\n` +
    `- __Why this is a rule__: We want to promote an active community, and in doing so reward the members who are contributing to the server. If you're not contributing anything yourself, you're actively taking away from those who make this server what it is. Thank you for understanding.`;

// Karuta
const karutaDropButton = new ButtonBuilder()
    .setCustomId("toggleKarutaDrop")
    .setLabel("Karuta Drop")
    .setStyle(ButtonStyle.Primary);
const karutaWishlistButton = new ButtonBuilder()
    .setCustomId("toggleKarutaWishlist")
    .setLabel("Karuta Wishlist")
    .setStyle(ButtonStyle.Primary);
const karutaEventButton = new ButtonBuilder()
    .setCustomId("toggleKarutaEvent")
    .setLabel("Karuta Event")
    .setStyle(ButtonStyle.Primary);
const karutaRow = new ActionRowBuilder().addComponents(
    karutaDropButton,
    karutaWishlistButton,
    karutaEventButton
);

// Sofi
const sofiWishlistButton = new ButtonBuilder()
    .setCustomId("toggleSofiWishlist")
    .setLabel("Sofi Wishlist")
    .setStyle(ButtonStyle.Primary);
const sofiRow = new ActionRowBuilder().addComponents(sofiWishlistButton);

// Tofu
const tofuDropButton = new ButtonBuilder()
    .setCustomId("toggleTofuDrop")
    .setLabel("Tofu Drop")
    .setStyle(ButtonStyle.Primary);
const tofuWishlistButton = new ButtonBuilder()
    .setCustomId("toggleTofuWishlist")
    .setLabel("Tofu Wishlist")
    .setStyle(ButtonStyle.Primary);
const tofuRow = new ActionRowBuilder().addComponents(tofuDropButton, tofuWishlistButton);

// Gachapon
const gachaponDropButton = new ButtonBuilder()
    .setCustomId("toggleGachaponDrop")
    .setLabel("Gachapon Drop")
    .setStyle(ButtonStyle.Primary);
const gachaponWishlistButton = new ButtonBuilder()
    .setCustomId("toggleGachaponWishlist")
    .setLabel("Gachapon Wishlist")
    .setStyle(ButtonStyle.Primary);
const gachaponRow = new ActionRowBuilder().addComponents(
    gachaponDropButton,
    gachaponWishlistButton
);

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
            content: pings,
            components: [karutaRow, sofiRow, tofuRow, gachaponRow],
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: activePlayer,
            allowedMentions: { parse: [] },
        });

        await interaction.channel.send({
            content: lurking,
            allowedMentions: { parse: [] },
        });
        await interaction.reply({ content: "Done!", ephemeral: true });
    },
};
