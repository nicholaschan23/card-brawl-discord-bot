const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const GiveawayModel = require("../../../giveaway/schemas/giveawaySchema");
const ScheduleModel = require("../../../schedule/schemas/scheduleSchema");
const endGiveaway = require("../../../giveaway/tasks/endGiveaway");
const getGiveawayEmbed = require("../../../giveaway/embeds/giveawayAnnouncement");
const { unixTimeToCron } = require("../../../schedule/src/schedule");
const client = require("../../../index");
const config = require("../../../../config.json");
const cron = require("node-cron");

module.exports = {
    category: "moderator/giveaway",
    data: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a giveaway.")
        .addStringOption((option) =>
            option
                .setName("prize")
                .setDescription("Title of the cards that are being given away.")
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("sponsor")
                .setDescription("Sponsor of this giveaway.")
                .setRequired(true)
        )
        .addAttachmentOption((option) =>
            option.setName("image").setDescription("Image of the card being given away.")
        )
        .addIntegerOption((option) =>
            option
                .setName("winners")
                .setDescription("Number of winners (Default: 1 winner).")
                .setMinValue(1)
                .setMaxValue(10)
        )
        .addIntegerOption((option) =>
            option
                .setName("duration")
                .setDescription("Duration of the giveaway in days (Default: 1 day).")
                .setMinValue(1)
                .setMaxValue(7)
        ),
    async execute(interaction) {
        // Gather input variables
        const prize = interaction.options.getString("prize");

        const attachment = interaction.options.getAttachment("image");
        if (attachment && attachment.contentType !== "image/png") {
            return await interaction.reply({
                content: "The attachment is not an image png.",
                ephemeral: true,
            });
        }
        const image = attachment ? attachment.proxyURL : null;
        const winners = interaction.options.getInteger("winners") ?? 1;

        const duration = interaction.options.getInteger("duration") ?? 1;
        const currentDate = new Date();
        const endTime = new Date(currentDate);
        endTime.setUTCDate(currentDate.getUTCDate() + duration);
        const unixEndTime = Math.floor(endTime.getTime() / 1000); // Seconds

        const sponsor = interaction.options.getUser("sponsor") ?? interaction.user;
        if (sponsor.bot) {
            return await interaction.reply({
                content: "The sponsor cannot be a bot.",
                ephemeral: true,
            });
        }
        const sponsorID = sponsor.id;

        // Intialize giveaway schema model
        const giveawayModel = new GiveawayModel({
            prize: prize,
            winners: winners,
            unixEndTime: unixEndTime,
            host: interaction.user.id,
            sponsor: sponsorID,
        });

        // Send embed
        const giveawayEmbed = getGiveawayEmbed(giveawayModel);
        giveawayEmbed.setColor(config.embed.blue);
        if (image) {
            console.log("[INFO] [createGiveaway] Image found");
            giveawayEmbed.setImage(image);
        }
        const cancel = new ButtonBuilder()
            .setCustomId("cancelGiveaway")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const confirm = new ButtonBuilder()
            .setCustomId("confirmGiveaway")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);
        const response = await interaction.reply({
            content: "Review your giveaway details.",
            embeds: [giveawayEmbed],
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
                case "cancelGiveaway": {
                    giveawayEmbed.setColor(config.embed.red);
                    await confirmation.update({
                        embeds: [giveawayEmbed],
                        components: [],
                    });
                    return;
                }
                case "confirmGiveaway": {
                    // Announce brawl bracket creation for contestants to join
                    const enter = new ButtonBuilder()
                        .setCustomId("enterGiveaway")
                        .setEmoji("🎉")
                        .setStyle(ButtonStyle.Primary);
                    const participants = new ButtonBuilder()
                        .setCustomId("viewParticipants")
                        .setLabel("Participants")
                        .setStyle(ButtonStyle.Secondary);
                    const row = new ActionRowBuilder().addComponents(enter, participants);
                    const channel = client.channels.cache.get(config.channelID.giveaway);
                    const message = await channel.send({
                        embeds: [giveawayEmbed],
                        components: [row],
                    });
                    giveawayModel.messageID = message.id;
                    await channel.send(
                        `<@&${config.roleID.giveaway}> Click 🎉 to join the giveaway!`
                    );

                    // Save BrawlSetupModel
                    try {
                        await giveawayModel.save();
                    } catch (error) {
                        console.error(
                            "[GIVEAWAY CREATE] Error saving GiveawayModel:",
                            error
                        );
                        giveawayEmbed.setColor(config.embed.red);
                        await confirmation.update({
                            embeds: [giveawayEmbed],
                            components: [],
                        });
                        return;
                    }

                    giveawayEmbed.setColor(config.embed.green);
                    await confirmation.update({
                        content: "Giveaway created!",
                        embeds: [giveawayEmbed],
                        components: [],
                    });
                    console.log("[GIVEAWAY CREATE] Successfully created a giveaway");
                    break;
                }
            }
        } catch (error) {
            console.warn("[GIVEAWAY CREATE]", error);
            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Schedule ending the giveaway in case bot restart
        const scheduleModel = new ScheduleModel({
            name: `endGiveaway${giveawayModel.messageID}`,
            task: "giveaway/tasks/endGiveaway",
            cron: `${unixTimeToCron(giveawayModel.unixEndTime * 1000)}`,
            data: {
                messageID: giveawayModel.messageID,
                scheduleName: `endGiveaway${giveawayModel.messageID}`,
            },
        });
        await scheduleModel.save();
        console.log("[GIVEAWAY CREATE] Defined end giveaway schema");

        // Schedule when to roll winner
        cron.schedule(scheduleModel.cron, () => {
            endGiveaway(scheduleModel.data);
        });
        console.log("Scheduled end giveaway");
    },
};
