const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const { formatTitle } = require("../../../functions/formatTitle");
const { getEnterEmbed } = require("../../../functions/embeds/brawlEnter");
const { getAnnouncementEmbed } = require("../../../functions/embeds/brawlAnnouncement");
const { client, setupModelQueue } = require("../../../index");
const config = require("../../../../config.json");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");

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
            console.error("Error retrieving BrawlSetupModel: ", error);
            return await interaction.reply(
                `There was an error retrieving the Card Brawl. Notifying <@${config.developerID}>.`
            );
        }

        // Check preconditions
        if (!setupModel.cards.open) {
            return await interaction.reply(`The **${setupModel.name}** Card Brawl is closed!`);
        }

        // Developer debugging bypass
        if (userID !== config.developerID) {
            // Check if user is eligible for multiple entries
            if (setupModel.entries.get(userID)) {
                // Already an entry
                if (
                    interaction.member.roles.cache.some((role) => role.name === "Server Subscriber")
                ) {
                    // Server subscriber gets max 2 entries
                    if (setupModel.entries.get(userID).length === 2) {
                        return await interaction.reply({
                            content: `<@${userID}>, you already entered **2 cards** for the **${setupModel.name}** Card Brawl.`,
                            allowedMentions: { parse: [] },
                        });
                    }
                } else {
                    return await interaction.reply({
                        content: `<@${userID}>, you already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.serverSubscriberRole}> to submit **2 cards**!`,
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
                time: 60000,
            });

            switch (confirmation.customId) {
                case "cancelEnter": {
                    enterEmbed.setColor(config.red);
                    return await confirmation.update({
                        content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
                        embeds: [enterEmbed],
                        components: [],
                        allowedMentions: { parse: [] },
                    });
                }
                case "confirmEnter": {
                    enterEmbed.setColor(config.green);
                    await confirmation.update({
                        content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
                        embeds: [enterEmbed],
                        components: [],
                        allowedMentions: { parse: [] },
                    });
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Ask for card details
        const message = await channel.send({
            content: `<@${userID}>, show the card you want to submit: \`kci <card code>\``,
            allowedMentions: { parse: [] },
        });

        // Read card details embed
        const botResponseFilter = (response) =>
            response.author.id === config.karutaID &&
            response.channelId === interaction.channel.id &&
            response.mentions.repliedUser.id === userID;
        let embedMessage, botResponseEmbed, description;
        try {
            const collected = await interaction.channel.awaitMessages({
                filter: botResponseFilter,
                max: 1,
                time: 60000,
                errors: ["time"],
            });

            embedMessage = collected.first();
            try {
                botResponseEmbed = embedMessage.embeds[0].data;
                description = botResponseEmbed.description;
                if (
                    botResponseEmbed.title !== "Card Details" ||
                    (botResponseEmbed.title === "Card Details" &&
                        !description.includes("Dropped in server ID"))
                ) {
                    return await embedMessage.reply({
                        content: `Karuta embeded message found. Wrong Karuta command.`,
                        ephemeral: true,
                    });
                }
            } catch (error) {
                return await embedMessage.reply({
                    content: `Karuta embeded message not found.`,
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("Error while waiting for response:", error);
            return await message.reply({
                content: "Card details not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Find first match of regex to extract card code
        // Define a regular expression to match the content between backticks
        // Use the `exec` method to find the first match
        const regex = /`([^`]+)`/;
        const match = regex.exec(botResponseEmbed.description);
        if (!match) {
            console.error(`Error finding card code between backticks. Found "${cardCode}".`);
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
        const cardImage = botResponseEmbed.thumbnail.url; // Alternative is .proxy_url

        // Check card requirements
        if (!description.includes(`Owned by <@${userID}>`)) {
            return await embedMessage.reply("You do not own this card.");
        } else if (setupModel.series !== null && !description.includes(setupModel.series)) {
            return await embedMessage.reply(
                `This card is not from the \`${setupModel.series}\` series.`
            );
        } else if (!description.includes(`Framed with`)) {
            return await embedMessage.reply("This card is not framed.");
        } else if (!description.includes(`Morphed by`)) {
            return await embedMessage.reply("This card is not morphed.");
        } else if (description.includes(`Sketched by`)) {
            return await embedMessage.reply("This card is sketched.");
        }

        // Display card confirmation
        const cardEmbed = new EmbedBuilder().setColor(botResponseEmbed.color).setImage(cardImage);
        response = await channel.send({
            content: `<@${userID}>, is this the correct card you want to submit?`,
            embeds: [cardEmbed],
            components: [row],
            allowedMentions: { parse: [] },
        });

        // Update embed based on button press
        try {
            confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60000,
            });

            switch (confirmation.customId) {
                case "cancelEnter": {
                    cardEmbed.setColor(config.red);
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
                        const recentSetupModel = await BrawlSetupModel.findOne({ name }).exec();

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
                                    // Server subscriber gets max 2 entries
                                    if (setupModel.entries.get(userID).length === 2) {
                                        throw new Error(
                                            `<@${userID}>, you already entered **2 cards** for the **${setupModel.name}** Card Brawl.`
                                        );
                                    }
                                } else {
                                    throw new Error(
                                        `<@${userID}>, you already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.serverSubscriberRole}> to submit **2 cards**!`
                                    );
                                }
                            }
                        }

                        // Add card to the brawl in database
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
                        const updatedEmbed = getAnnouncementEmbed(
                            recentSetupModel.name,
                            recentSetupModel.theme,
                            recentSetupModel.series,
                            recentSetupModel.cards.size
                        );
                        const competitorsChannel = client.channels.cache.get(
                            config.competitorsChannelID
                        );
                        competitorsChannel.messages
                            .fetch(recentSetupModel.messageID)
                            .then((message) => {
                                message.edit({
                                    content: `Type \`/brawl enter ${name}\` to join this Card Brawl! 🥊 <@&${config.competitorRole}>`,
                                    embeds: [updatedEmbed],
                                });
                            });
                    };
                    try {
                        await setupModelQueue.enqueue(task);
                        await channel.send(
                            `Successfully submitted \`${cardCode}\` to the **${setupModel.name}** Card Brawl!`
                        );
                    } catch (error) {
                        cardEmbed.setColor(config.red);
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

                    cardEmbed.setColor(config.green);
                    await confirmation.update({
                        content: `<@${userID}>, is this the correct card you want to submit?`,
                        embeds: [cardEmbed],
                        components: [],
                        allowedMentions: { parse: [] },
                    });
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            return await response.reply({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};
