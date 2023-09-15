const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const config = require("../../../../config.json");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");

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
                    "Write a sentence regarding the theme contestants will match to enter the the card brawl."
                )
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("size")
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
        ),
    // .addIntegerOption((option) =>
    //     option
    //         .setName("deadline")
    //         .setDescription("How many days will submissions be open for?")
    //         .setMinValue(1)
    //         .setMaxValue(7)
    // )
    // .addStringOption((option) =>
    //     option
    //         .setName("mode")
    //         .setDescription(
    //             "Will viewers see matchups and vote in real-time or not?"
    //         )
    //         .addChoices(
    //             { name: "Synchronous", value: "synchronous" },
    //             { name: "Asynchronous", value: "asynchronous" }
    //         )
    // ),
    async execute(interaction) {
        let name = interaction.options.getString("name");
        name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        let theme = interaction.options.getString("theme");
        theme = `${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
        let size = interaction.options.getInteger("size");
        // let deadline = interaction.options.getInteger("deadline") ?? 3;
        // let mode = interaction.options.getString("mode") ?? "synchronous";

        const createBrawlEmbed = new EmbedBuilder()
            .setColor(config.blue)
            .setTitle("Enter Card Brawl")
            // .setDescription(
            //     `Type \`/brawl enter ${name}\` to join this card brawl! 🥊\n`
            // )
            .addFields(
                {
                    name: "Name:",
                    value: `${name}`,
                },
                { name: "Theme:", value: `${theme}` },
                {
                    name: "Size:",
                    value: `${size}`,
                },
                {
                    name: "Requirements:",
                    value: `🖼️ Framed\n🎨 Morphed`,
                    inline: true,
                },
                {
                    name: "Optional:",
                    value: `💧 Dyed\n🩸 Sketched`,
                    inline: true,
                }
            );

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);

        // TODO: Add edit button options for changing requirements
        const edit = new ButtonBuilder()
            .setDisabled(true)
            .setCustomId("edit")
            .setLabel("Edit")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(edit, confirm);
        const row2 = new ActionRowBuilder().addComponents(cancel);

        const response = await interaction.reply({
            content: "Review your card brawl details.",
            embeds: [createBrawlEmbed],
            components: [row, row2],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id; // Only user who triggered command can use the buttons
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 30000,
            });

            switch (confirmation.customId) {
                case "cancel": {
                    createBrawlEmbed.setColor(config.red);
                    await confirmation.update({
                        embeds: [createBrawlEmbed],
                        components: [],
                    });
                    break;
                }
                case "confirm": {
                    try {
                        const setupModel = new BrawlSetupModel({
                            name: name,
                            theme: theme,
                            size: size,
                        });
                        await setupModel.save();
                    } catch (error) {
                        console.error("Error saving brawl setup:", error);
                    }

                    createBrawlEmbed.setColor(config.green);
                    await confirmation.update({
                        content: "Card brawl created!",
                        embeds: [createBrawlEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            await interaction.followUp({
                content: "Confirmation not received within 30 seconds, cancelling.",
                embeds: [],
                components: [],
            });
        }
    },

    // Announce brawl bracket creation for contestants to join
};
