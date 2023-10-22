const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const { getNextSaturday, createGuildEvent } = require("../../../functions/schedule/scheduleEvent");
const { formatTitle } = require("../../../functions/formatTitle");
const { getAnnouncementEmbed } = require("../../../functions/embeds/brawlAnnouncement");
const { client } = require("../../../index");
const config = require("../../../../config.json");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a Card Brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Name contestants will use to enter the card competition.")
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

        // Check if name already exists
        try {
            const setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (setupModel) {
                return await interaction.reply(`Another Card Brawl already exists with this name.`);
            }
        } catch (error) {
            console.error("Error retrieving BrawlSetupModel: ", error);
            return await interaction.reply(
                `There was an error retrieving the Card Brawl. Notifying <@${config.developerID}>.`
            );
        }

        // Get start time
        const times = getNextSaturday();
        const unixStartTime = Math.floor(times.start / 1000);
        
        // Review create embed
        const setupBrawlEmbed = getAnnouncementEmbed(name, theme, series, 0, unixStartTime);
        const confirm = new ButtonBuilder()
            .setCustomId("confirmCreate")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId("cancelCreate")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
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
                    setupBrawlEmbed.setColor(config.red);
                    await confirmation.update({
                        embeds: [setupBrawlEmbed],
                        components: [],
                    });
                    break;
                }
                case "confirmCreate": {
                    const setupModel = new BrawlSetupModel({
                        name: name,
                        theme: theme,
                        series: series,
                        messageID: message.id,
                        unixStartTime: unixStartTime,
                    });

                    // Save BrawlSetupModel
                    try {
                        await setupModel.save();
                    } catch (error) {
                        console.error("Error saving BrawlSetupModel: ", error);
                        setupBrawlEmbed.setColor(config.red);
                        await confirmation.update({
                            embeds: [setupBrawlEmbed],
                            components: [],
                        });
                        return;
                    }

                    // Announce brawl bracket creation for contestants to join
                    const channel = client.channels.cache.get(config.competitorsChannelID);
                    const message = await channel.send({
                        content: `Type \`/brawl enter ${name}\` to join this Card Brawl! 🥊 <@&${config.competitorRole}>`,
                        embeds: [setupBrawlEmbed],
                    });

                    // Create server event
                    createGuildEvent(setupModel);

                    setupBrawlEmbed.setColor(config.green);
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
            await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};
