const {
    SlashCommandSubcommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const getGiveawayEmbed = require("../../../giveaway/embeds/giveawayAnnouncement");
const { unixTimeToCron } = require("../../../schedule/src/schedule");
const client = require("../../../index");
const config = require("../../../../config.json");
const GiveawayModel = require("../../../giveaway/schemas/giveawaySchema");
const ScheduleModel = require("../../../schedule/schemas/scheduleSchema");

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
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setDescription("Image of the cards being given away.")
                .setRequired(true)
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
                .setMaxValue(3)
        )
        .addUserOption((option) =>
            option.setName("sponsor").setDescription("Sponsor of this giveaway. (Default host)")
        ),
    async execute(interaction) {
        // Moderator permissions
        if (!interaction.member.roles.cache.some((role) => role.name === "Moderator")) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        // Gather input variables
        const prize = interaction.options.getString("prize");

        const attachment = interaction.options.getAttachment("image");
        if (attachment.contentType !== "image/png") {
            return await interaction.reply({
                content: "The attachment is not a image png.",
                ephemeral: true,
            });
        }
        const winners = interaction.options.getInteger("winners") ?? 1;

        const duration = interaction.options.getInteger("duration") ?? 1;
        const currentDate = new Date();
        const endTime = new Date(currentDate);
        endTime.setUTCDate(currentDate.getUTCDate() + duration);
        const unixEndTime = Math.floor(endTime.getTime() / 1000); // Seconds

        const sponsor = interaction.options.getUser("sponsor") ?? interaction.user;
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
        const giveawayEmbed = getGiveawayEmbed(giveawayModel, attachment.proxyURL);
        giveawayEmbed.setColor(config.blue);
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
                    giveawayEmbed.setColor(config.red);
                    await confirmation.update({
                        embeds: [giveawayEmbed],
                        components: [],
                    });
                    break;
                }
                case "confirmGiveaway": {
                    // Announce brawl bracket creation for contestants to join
                    const enter = new ButtonBuilder()
                        .setCustomId("enterGiveaway")
                        .setEmoji("🎉")
                        .setStyle(ButtonStyle.Primary);
                    const participants = new ButtonBuilder()
                        .setCustomId("participants")
                        .setEmoji(config.emojiToken)
                        .setLabel("Participants")
                        .setStyle(ButtonStyle.Secondary);
                    const row = new ActionRowBuilder().addComponents(enter, participants);
                    // const channel = client.channels.cache.get(config.giveawayChannelID);
                    const channel = interaction.channel;
                    const message = await channel.send({
                        embeds: [giveawayEmbed],
                        components: [row],
                    });
                    giveawayModel.messageID = message.id;
                    await channel.send(`Giveaway Click 🎉 to join the giveaway!`);

                    // Save BrawlSetupModel
                    try {
                        await giveawayModel.save();
                    } catch (error) {
                        console.error("[GIVEAWAY CREATE] Error saving GiveawayModel:", error);
                        giveawayEmbed.setColor(config.red);
                        await confirmation.update({
                            embeds: [giveawayEmbed],
                            components: [],
                        });
                        return;
                    }

                    giveawayEmbed.setColor(config.green);
                    await confirmation.update({
                        content: "Card Brawl created!",
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

        // Schedule ending the giveaway
        const endGiveaway = new ScheduleModel({
            name: `Giveaway${giveawayModel.messageID}`,
            task: "sendReminder",
            cron: `${unixTimeToCron(giveawayModel.unixEndTime * 1000)}`,
            data: {
                messageID: giveawayModel.messageID,
                scheduleName: `Giveaway${giveawayModel.messageID}`,
            },
        });
        await endGiveaway.save();
        console.log("[GIVEAWAY CREATE] Defined end giveaway schema");
    },
};
