const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const config = require("../../../../config.json");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a card brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription(
                    "Name contestants will use to enter the card brawl."
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("theme")
                .setDescription(
                    "Theme contestants will match to enter the the card brawl."
                )
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("entries")
                .setDescription("How many cards can enter the brawl?")
                .addChoices(
                    { name: "2", value: 2 },
                    { name: "4", value: 4 },
                    { name: "8", value: 8 },
                    { name: "16", value: 16 },
                    { name: "32", value: 32 },
                    { name: "64", value: 64 }
                )
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("deadline")
                .setDescription("How many days will submissions be open for?")
                .setMinValue(1)
                .setMaxValue(7)
        )
        .addStringOption((option) =>
            option
                .setName("mode")
                .setDescription(
                    "Will viewers see matchups and vote in real-time or not?"
                )
                .addChoices(
                    { name: "Synchronous", value: "synchronous" },
                    { name: "Asynchronous", value: "asynchronous" }
                )
        ),
    async execute(interaction) {
        // Execute logic for the 'create' subcommand
        let name = interaction.options.getString("name");
        let theme = interaction.options.getString("theme");
        let entries = interaction.options.getInteger("entries");
        let deadline = interaction.options.getInteger("deadline") ?? 3;
        let mode = interaction.options.getString("mode") ?? "synchronous";

        const createBrawlEmbed = new EmbedBuilder()
            .setColor(config.blue)
            .setTitle(name)
            .setDescription(
                `Type \`/brawl enter ${name}\` to join this card brawl! 🥊\nTheme: **${theme}**\nEntries: **${entries}**\nSubmissions close: in **${deadline} days**`
            )
            .addFields({
                name: "Requirements:",
                value: "- 🖼️ Framed\n- 💧 Dyed",
            })
            .addFields({ name: "Details", value: `- Mode: \`${mode}\`` });

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);

        const edit = new ButtonBuilder()
            .setDisabled(true)
            .setCustomId("edit")
            .setLabel("Edit")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(edit, confirm);
        const row2 = new ActionRowBuilder().addComponents(cancel);

        const response = await interaction.reply({
            content:
                'Review your card brawl and click "Confirm" to allow contestants to enter.',
            embeds: [createBrawlEmbed],
            components: [row, row2],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id; // Only user who triggered command can use the buttons
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60000,
            });

            switch (confirmation.customId) {
                case "cancel": {
                    await response.delete();
                    break;
                }
                case "confirm": {
                    createBrawlEmbed.setColor(config.green);
                    await confirmation.update({
                        embeds: [createBrawlEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            await interaction.editReply({
                content:
                    "Confirmation not received within 1 minute, cancelling.",
                embeds: [],
                components: [],
            });
        }
    },
};
