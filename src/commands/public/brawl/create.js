const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const config = require("../../../../config.json");
const client = require("../../../index");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const {
    getAnnouncementEmbed,
} = require("../../../functions/embeds/brawlAnnouncement");

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
        if (
            !interaction.member.roles.cache.some(
                (role) => role.name === "Moderator"
            )
        ) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
            return;
        }

        const {
            formatTitle,
            formatTheme,
        } = require("../../../functions/formatWords");
        let name = formatTitle(interaction.options.getString("name"));
        let theme = formatTheme(interaction.options.getString("theme"));
        let size = interaction.options.getInteger("size");
        // let deadline = interaction.options.getInteger("deadline") ?? 3;
        // let mode = interaction.options.getString("mode") ?? "synchronous";

        const setupBrawlEmbed = getAnnouncementEmbed(
            name,
            theme,
            size,
            interaction.user.id
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
        // const edit = new ButtonBuilder()
        //     .setDisabled(true)
        //     .setCustomId("edit")
        //     .setLabel("Edit")
        //     .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);
        // const row2 = new ActionRowBuilder().addComponents(cancel);

        const response = await interaction.reply({
            content: "Review your card brawl details.",
            embeds: [setupBrawlEmbed],
            components: [row],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id; // Only user who triggered command can use the buttons
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 30000,
            });

            switch (confirmation.customId) {
                case "cancel": {
                    setupBrawlEmbed.setColor(config.red);
                    await confirmation.update({
                        embeds: [setupBrawlEmbed],
                        components: [],
                    });
                    break;
                }
                case "confirm": {
                    // Announce brawl bracket creation for contestants to join
                    const channel = client.channels.cache.get(
                        config.announcementChannelID
                    );
                    const message = await channel.send({
                        embeds: [setupBrawlEmbed],
                    });
                    channel.send(
                        `Type \`/brawl enter ${name}\` to join this card brawl! <@&872334793885503581>`
                    );

                    try {
                        const setupModel = new BrawlSetupModel({
                            name: name,
                            theme: theme,
                            size: size,
                            messageID: message.id,
                            hostID: interaction.user.id,
                        });
                        await setupModel.save();
                    } catch (error) {
                        console.error("Error saving brawl setup:", error);
                    }

                    setupBrawlEmbed.setColor(config.green);
                    await confirmation.update({
                        content: "Card brawl created!",
                        embeds: [setupBrawlEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            await interaction.followUp({
                content:
                    "Confirmation not received within 30 seconds, cancelling.",
                ephemeral: true,
            });
        }
    },
};
