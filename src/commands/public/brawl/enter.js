const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const BrawlSetupModel = require("../../../brawl/schemas/brawlSetupSchema");
const getEnterEmbed = require("../../../brawl/embeds/brawlEnter");
const getAnnouncementEmbed = require("../../../brawl/embeds/brawlAnnouncement");
const formatTitle = require("../../../brawl/src/formatTitle");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("enter")
        .setDescription("Enter a card competition.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Card Brawl name you will be entering.")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async execute(interaction) {
        const name = formatTitle(interaction.options.getString("name"));
        const channel = client.channels.cache.get(interaction.channel.id);
        const userID = interaction.user.id;

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                return await interaction.reply({
                    content: `No Card Brawl found with the name "${name}".`,
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("[BRAWL ENTER] Error retrieving BrawlSetupModel:", error);
            return await interaction.reply(
                `Error retrieving Card Brawl. Notifying <@${config.developerID}>.`
            );
        }

        // Check preconditions
        if (!setupModel.open) {
            return await interaction.reply(
                `The **${setupModel.name}** Card Brawl is closed!`
            );
        }

        // Developer debugging bypass
        if (userID !== config.developerID) {
            // Check if user is eligible for multiple entries
            if (setupModel.entries.get(userID)) {
                // Already an entry
                if (
                    interaction.member.roles.cache.some(
                        (role) => role.name === "Server Subscriber"
                    )
                ) {
                    // Server subscriber gets bonus entries
                    if (
                        setupModel.entries.get(userID).length ===
                        config.brawl.serverSubscriberEntry
                    ) {
                        return await interaction.reply({
                            content: `<@${userID}>, you already entered **${config.brawl.serverSubscriberEntry} cards** for the **${setupModel.name}** Card Brawl.`,
                            allowedMentions: { parse: [] },
                        });
                    }
                } else {
                    return await interaction.reply({
                        content: `<@${userID}>, you already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.roleID.serverSubscriber}> to submit up to **${config.brawl.serverSubscriberEntry} cards**!`,
                        allowedMentions: { parse: [] },
                    });
                }
            }
        }

        // Confirm correct brawl data
        const enterEmbed = getEnterEmbed(setupModel);
        const confirm = new ButtonBuilder()
            .setCustomId("confirmEnter")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId("cancelEnter")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        // Display card brawl details
        let response = await interaction.reply({
            content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
            embeds: [enterEmbed],
            components: [row],
            allowedMentions: { parse: [] },
        });

        // Update embed based on button press
        const collectorFilter = (i) => i.user.id === userID;
        let confirmation;
        try {
            confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                max: 1,
                time: 60 * 1000,
            });
        } catch (error) {
            console.warn("[BRAWL ENTER] Command timed out:", interaction.user.tag);

            enterEmbed.setColor(config.embed.red);
            await confirmation.update({
                content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
                embeds: [enterEmbed],
                components: [],
                allowedMentions: { parse: [] },
            });

            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Confirmation received
        switch (confirmation.customId) {
            case "cancelEnter": {
                enterEmbed.setColor(config.embed.red);
                return await confirmation.update({
                    content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
                    embeds: [enterEmbed],
                    components: [],
                    allowedMentions: { parse: [] },
                });
            }
            case "confirmEnter": {
                enterEmbed.setColor(config.embed.green);
                await confirmation.update({
                    content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
                    embeds: [enterEmbed],
                    components: [],
                    allowedMentions: { parse: [] },
                });
                break;
            }
        }

        // Ask for card details
        await channel.send({
            content: `<@${userID}>, show the card you want to submit: \`kci <card code>\``,
            allowedMentions: { parse: [] },
        });

        // Read card details embed
        const botResponseFilter = (response) =>
            response.author.id === config.botID.karuta &&
            response.channelId === interaction.channel.id &&
            response.mentions.repliedUser &&
            response.mentions.repliedUser.id === userID &&
            response.embeds.length === 1 &&
            response.embeds[0].data.title === "Card Details" &&
            response.embeds[0].data.description.includes("Dropped in server ID");
        let collected;
        try {
            collected = await interaction.channel.awaitMessages({
                filter: botResponseFilter,
                max: 1,
                time: 60 * 1000,
            });
        } catch (error) {
            console.warn("[BRAWL ENTER] Command timed out:", interaction.user.tag);

            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Confirmation received
        console.log(
            "[BRAWL ENTER] Found Card Details embed for: " + interaction.user.tag
        );
        let embedMessage;
        try {
            embedMessage = collected.first();
        } catch (error) {
            return await interaction.followUp({
                content: "Card embed not found.",
                ephemeral: true,
            });
        }
        const botResponseEmbed = embedMessage.embeds[0].data;
        const description = botResponseEmbed.description;

        // Find first match of regex to extract card code
        // Define a regular expression to match the content between backticks
        // Use the `exec` method to find the first match
        const regex = /`([^`]+)`/;
        const match = regex.exec(botResponseEmbed.description);
        if (!match) {
            console.warn(
                `[BRAWL ENTER] Coudn't finding card code between backticks. Found "${cardCode}"`
            );
            return await embedMessage.reply(
                `Error finding card code. Found \`${cardCode}\`. Notifying <@${config.developerID}>.`
            );
        }
        const cardCode = match[1];

        // Check precondition
        if (setupModel.cards.get(cardCode)) {
            return await embedMessage.reply({
                content: `<@${userID}>, this card is already submitted to this Card Brawl.`,
                allowedMentions: { parse: [] },
            });
        }

        // Check card requirements
        if (!description.includes(`Owned by <@${userID}>`)) {
            return await embedMessage.reply("You do not own this card.");
        }
        if (setupModel.series !== null && !description.includes(setupModel.series)) {
            return await embedMessage.reply(
                `This card is not from the \`${setupModel.series}\` series.`
            );
        }
        if (!description.includes(`Framed with`)) {
            return await embedMessage.reply("This card is not framed.");
        }
        if (!description.includes(`Morphed by`)) {
            return await embedMessage.reply("This card is not morphed.");
        }
        // Check sketch
        if (setupModel.sketch === "prohibited") {
            if (description.includes(`Sketched by`)) {
                return await embedMessage.reply("This card is sketched.");
            }
        }

        // Display card confirmation
        const cardImage = botResponseEmbed.thumbnail.url; // .proxy_url
        const cardEmbed = new EmbedBuilder()
            .setColor(botResponseEmbed.color)
            .setImage(cardImage);
        response = await channel.send({
            content: `<@${userID}>, is this the correct card you want to submit?`,
            embeds: [cardEmbed],
            components: [row],
            allowedMentions: { parse: [] },
        });

        // Collect button press interaction
        try {
            confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                max: 1,
                time: 60 * 1000,
            });
        } catch (error) {
            console.warn("[BRAWL ENTER] Command timed out:", interaction.user.tag);

            cardEmbed.setColor(config.embed.red);
            await response.edit({
                content: `<@${userID}>, is this the correct card you want to submit?`,
                embeds: [cardEmbed],
                components: [],
                allowedMentions: { parse: [] },
            });

            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Button press confirmed
        switch (confirmation.customId) {
            case "cancelEnter": {
                cardEmbed.setColor(config.embed.red);
                return await confirmation.update({
                    content: `<@${userID}>, is this the correct card you want to submit?`,
                    embeds: [cardEmbed],
                    components: [],
                    allowedMentions: { parse: [] },
                });
            }
            case "confirmEnter": {
                // Get the most recent setupModel queue to handle concurrent saving
                const task = async () => {
                    // Get most recent setupModel at the head of the queue
                    const recentSetupModel = await BrawlSetupModel.findOne({
                        name,
                    }).exec();

                    // Check eligibility again
                    if (!recentSetupModel.open) {
                        throw new Error(
                            `The **${recentSetupModel.name}** Card Brawl is closed!`
                        );
                    }

                    if (recentSetupModel.cards.get(cardCode)) {
                        throw new Error(
                            `<@${userID}>, this card is already submitted to this Card Brawl.`
                        );
                    }

                    // Check if user is eligible for multiple entries
                    if (userID !== config.developerID) {
                        // Debugging
                        if (recentSetupModel.entries.get(userID)) {
                            // Already an entry
                            if (
                                interaction.member.roles.cache.some(
                                    (role) => role.name === "Server Subscriber"
                                )
                            ) {
                                // Server subscriber gets bonus entries
                                if (
                                    setupModel.entries.get(userID).length ===
                                    config.brawl.serverSubscriberEntry
                                ) {
                                    throw new Error(
                                        `<@${userID}>, you already entered **${config.brawl.serverSubscriberEntry} cards** for the **${setupModel.name}** Card Brawl.`
                                    );
                                }
                            } else {
                                throw new Error(
                                    `<@${userID}>, you already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.roleID.serverSubscriber}> to submit up to **${config.brawl.serverSubscriberEntry} cards**!`
                                );
                            }
                        }
                    }

                    // Check prerequisites again
                    if (recentSetupModel.entries.get(userID)) {
                        recentSetupModel.entries.get(userID).push(cardCode);
                    } else {
                        recentSetupModel.entries.set(userID, [cardCode]);
                    }
                    const imageSchema = {
                        imageLink: cardImage,
                        userID: userID,
                    };
                    recentSetupModel.cards.set(cardCode, imageSchema);
                    await recentSetupModel.save();

                    // Update announcement embed
                    const updatedEmbed = getAnnouncementEmbed(recentSetupModel);
                    const competitorsChannel = client.channels.cache.get(
                        config.channelID.brawlCompetitors
                    );
                    competitorsChannel.messages
                        .fetch(recentSetupModel.messageID)
                        .then((message) => {
                            message.edit({
                                content: `Type \`/brawl enter ${name}\` to join this Card Brawl! 🥊 <@&${config.roleID.brawlCompetitor}>`,
                                embeds: [updatedEmbed],
                            });
                        });
                };

                // Add card to the brawl in database
                try {
                    await client.setupModelQueue.enqueue(task);
                    await channel.send(
                        `Successfully submitted \`${cardCode}\` to the **${setupModel.name}** Card Brawl!`
                    );

                    cardEmbed.setColor(config.embed.green);
                    await confirmation.update({
                        content: `<@${userID}>, is this the correct card you want to submit?`,
                        embeds: [cardEmbed],
                        components: [],
                        allowedMentions: { parse: [] },
                    });
                } catch (error) {
                    console.error("[BRAWL ENTER]:", error);

                    cardEmbed.setColor(config.embed.red);
                    await confirmation.update({
                        content: `<@${userID}>, is this the correct card you want to submit?`,
                        embeds: [cardEmbed],
                        components: [],
                        allowedMentions: { parse: [] },
                    });

                    return await channel.send({
                        content: error.message,
                        allowedMentions: { parse: [] },
                    });
                }
                break;
            }
        }
        console.log(
            `[BRAWL ENTER] Successfully submitted ${cardCode} to the ${setupModel.name} Card Brawl:`,
            interaction.user.tag
        );
    },
};
