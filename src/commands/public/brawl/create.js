const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const BrawlSetupModel = require("../../../brawl/schemas/brawlSetupSchema");
const getAnnouncementEmbed = require("../../../brawl/embeds/brawlAnnouncement");
const formatTitle = require("../../../brawl/src/formatTitle");
const { getNextSaturday, createGuildEvent } = require("../../../schedule/src/schedule");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a Card Brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription(
                    "Name contestants will use to enter the card competition."
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("theme")
                .setDescription(
                    "Set the theme contestants will match to enter the the card competition."
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("series")
                .setDescription(
                    "Set the series the card must be from to enter the the card competition."
                )
        )
        .addStringOption((option) =>
            option
                .setName("sketch")
                .setDescription("Set requirements of sketched cards.")
                .addChoices(
                    {
                        name: "Prohibited",
                        value: "prohibited",
                    },
                    {
                        name: "Optional",
                        value: "optional",
                    }
                )
        ),
    async execute(interaction) {
        // Owner permissions
        if (!interaction.member.roles.cache.some((role) => role.name === "Owner")) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const name = formatTitle(interaction.options.getString("name"));
        const theme = formatTitle(interaction.options.getString("theme"));
        const series = interaction.options.getString("series") ?? null;
        const sketch = interaction.options.getString("sketch") ?? "prohibited";

        // Check if name already exists
        try {
            const setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (setupModel) {
                return await interaction.reply(
                    `Another Card Brawl already exists with this name.`
                );
            }
        } catch (error) {
            console.error("[ERROR] [create] Error retrieving 'BrawlSetupModel':", error);
            return await interaction.reply(
                `Error retrieving Card Brawl. Notifying <@${config.developerID}>.`
            );
        }

        // Get start time
        const times = getNextSaturday();
        const unixStartTime = Math.floor(times.start / 1000); // Seconds

        // Temporary setup model for announcement embed
        const temp = new BrawlSetupModel({
            name: name,
            theme: theme,
            series: series,
            sketch: sketch,
            unixStartTime: unixStartTime,
        });

        // Review create embed
        const setupBrawlEmbed = getAnnouncementEmbed(temp);
        const cancel = new ButtonBuilder()
            .setCustomId("cancelCreate")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const confirm = new ButtonBuilder()
            .setCustomId("confirmCreate")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);
        const response = await interaction.reply({
            content: "Review your Card Brawl details.",
            embeds: [setupBrawlEmbed],
            components: [row],
        });

        // Collect button response
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60000,
            });

            switch (confirmation.customId) {
                case "cancelCreate": {
                    setupBrawlEmbed.setColor(config.embed.red);
                    await confirmation.update({
                        embeds: [setupBrawlEmbed],
                        components: [],
                    });
                    break;
                }
                case "confirmCreate": {
                    // Announce brawl bracket creation for contestants to join
                    const channel = client.channels.cache.get(
                        config.channelID.brawCompetitors
                    );
                    const message = await channel.send({
                        content: `Type \`/brawl enter ${name}\` to join this Card Brawl! 🥊 <@&${config.roleID.brawlCompetitor}>`,
                        embeds: [setupBrawlEmbed],
                    });

                    // Define setup model
                    const setupModel = new BrawlSetupModel({
                        name: name,
                        theme: theme,
                        series: series,
                        sketch: sketch,
                        messageID: message.id,
                        unixStartTime: unixStartTime,
                    });
                    console.log("[BRAWL CREATE] New BrawlSetupModel defined");

                    // Save BrawlSetupModel
                    try {
                        await setupModel.save();
                    } catch (error) {
                        console.error(
                            "[BRAWL CREATE] Error saving BrawlSetupModel:",
                            error
                        );
                        setupBrawlEmbed.setColor(config.embed.red);
                        await confirmation.update({
                            embeds: [setupBrawlEmbed],
                            components: [],
                        });
                        return;
                    }

                    // Create server event
                    createGuildEvent(setupModel);

                    setupBrawlEmbed.setColor(config.embed.green);
                    await confirmation.update({
                        content: "Card Brawl created!",
                        embeds: [setupBrawlEmbed],
                        components: [],
                    });
                    console.log("[BRAWL CREATE] Successfully created a Card Brawl");
                    break;
                }
            }
        } catch (error) {
            console.error("[BRAWL CREATE]", error);
            await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};
