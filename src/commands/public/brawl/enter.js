const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const { formatTitle } = require("../../../functions/formatTitle");
const { getEnterEmbed } = require("../../../functions/embeds/brawlEnter");
const {
    getAnnouncementEmbed,
} = require("../../../functions/embeds/brawlAnnouncement");
const config = require("../../../../config.json");
const { client } = require("../../../index");
const { setupModelQueue } = require("../../../index");
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
        let message;

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                return await interaction.reply(
                    `No Card Brawl found with the name "${name}".`
                );
            }
        } catch (error) {
            console.log("Error retrieving Card Brawl setups:", error);
            return await interaction.reply(
                `There was an error retrieving the brawl.`
            );
        }

        // Check preconditions
        if (setupModel.cards.size === setupModel.size) {
            return await interaction.reply(
                `The **${setupModel.name}** Card Brawl is full!`
            );
        }

        // Check if user is eligible for multiple entries
        if (interaction.user.id !== config.developerID) {
            // Debugging
            if (setupModel.entries.get(interaction.user.id)) {
                // Already an entry
                if (
                    interaction.member.roles.cache.some(
                        (role) => role.name === "Server Subscriber"
                    )
                ) {
                    // Server subscriber gets max 2 entries
                    if (
                        setupModel.entries.get(interaction.user.id).length === 2
                    ) {
                        return await interaction.reply(
                            `You already entered **2 cards** for the **${setupModel.name}** Card Brawl.`
                        );
                    }
                } else {
                    return await interaction.reply({
                        content: `You already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.serverSubscriberRole}> to submit **2 cards**!`,
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
            content: "Is this the correct Card Brawl you want to enter?",
            embeds: [enterEmbed],
            components: [row],
        });

        // Update embed based on button press
        const collectorFilter = (i) => i.user.id === interaction.user.id;
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
                        content:
                            "Is this the correct Card Brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                }
                case "confirmEnter": {
                    enterEmbed.setColor(config.green);
                    await confirmation.update({
                        content:
                            "Is this the correct Card Brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            return await interaction.followUp(
                "Confirmation not received within `1 minute`, cancelling."
            );
        }
        message = await channel.send(
            "Show the card you want to submit: `kci <card code>`"
        );

        // Read card details embed
        const botResponseFilter = (response) =>
            response.author.id === config.karutaID &&
            response.channelId === interaction.channel.id &&
            response.mentions.repliedUser.id === interaction.user.id;
        let embedMessage, botResponseEmbed, description;
        try {
            const collected = await interaction.channel.awaitMessages({
                max: 1,
                time: 60000,
                errors: ["time"],
                filter: botResponseFilter,
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
                    await embedMessage.reply("Embed found. Wrong command.");
                    return;
                }
            } catch (error) {
                await embedMessage.reply("Embed not found.");
                return;
            }
        } catch (error) {
            console.log("Error while waiting for response:", error);
            return await message.reply({
                content:
                    "Card details not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }

        // Find first match of regex to extract card code
        // Define a regular expression to match the content between backticks
        // Use the `exec` method to find the first match
        const regex = /`([^`]+)`/;
        const match = regex.exec(botResponseEmbed.description);
        if (!match) {
            return await embedMessage.reply(
                `Error finding card code between backticks: \`${cardCode}\``
            );
        }
        const cardCode = match[1];

        // Check precondition
        if (setupModel.cards.get(cardCode)) {
            return await embedMessage.reply(
                "This card is already submitted to this Card Brawl."
            );
        }
        const cardImage = botResponseEmbed.thumbnail.url; // Alternative is .proxy_url

        // Check card requirements
        if (!description.includes(`Owned by <@${interaction.user.id}>`)) {
            return await embedMessage.reply("You do not own this card.");
        } else if (!description.includes(`Framed with`)) {
            return await embedMessage.reply("This card is not framed.");
        } else if (!description.includes(`Morphed by`)) {
            return await embedMessage.reply("This card is not morphed.");
        } else if (description.includes(`Sketched by`)) {
            return await embedMessage.reply("This card is sketched.");
        }

        // Display card confirmation
        const cardEmbed = new EmbedBuilder()
            .setColor(botResponseEmbed.color)
            .setImage(cardImage);
        response = await channel.send({
            content: "Is this the correct card you want to sumbit?",
            embeds: [cardEmbed],
            components: [row],
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
                        content: "Is this the correct card you want to submit?",
                        embeds: [cardEmbed],
                        components: [],
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
                        if (
                            recentSetupModel.cards.size ===
                            recentSetupModel.size
                        ) {
                            throw new Error(
                                `The **${recentSetupModel.name}** Card Brawl is full!`
                            );
                        }

                        if (recentSetupModel.cards.get(cardCode)) {
                            throw new Error(
                                "This card is already submitted to this Card Brawl."
                            );
                        }

                        // Check if user is eligible for multiple entries
                        if (interaction.user.id === interaction.user.id) {
                            // if (interaction.user.id !== config.developerID) {
                            // Debugging
                            if (
                                recentSetupModel.entries.get(
                                    interaction.user.id
                                )
                            ) {
                                // Already an entry
                                if (
                                    interaction.member.roles.cache.some(
                                        (role) =>
                                            role.name === "Server Subscriber"
                                    )
                                ) {
                                    // Server subscriber gets max 2 entries
                                    if (
                                        setupModel.entries.get(
                                            interaction.user.id
                                        ).length === 2
                                    ) {
                                        throw new Error(
                                            `You already entered **2 cards** for the **${setupModel.name}** Card Brawl.`
                                        );
                                    }
                                } else {
                                    throw new Error(
                                        `You already entered a card for the **${setupModel.name}** Card Brawl. Become a <@&${config.serverSubscriberRole}> to submit **2 cards**!`
                                    );
                                }
                            }
                        }

                        // Add card to the brawl in database
                        const imageSchema = {
                            imageLink: cardImage,
                            userID: interaction.user.id,
                        };
                        if (recentSetupModel.entries.get(interaction.user.id)) {
                            recentSetupModel.entries
                                .get(interaction.user.id)
                                .push(cardCode);
                        } else {
                            recentSetupModel.entries.set(interaction.user.id, [
                                cardCode,
                            ]);
                        }
                        recentSetupModel.cards.set(cardCode, imageSchema);
                        await recentSetupModel.save();

                        // Update announcement embed
                        const updatedEmbed = new getAnnouncementEmbed(
                            setupModel.name,
                            setupModel.theme,
                            setupModel.size,
                            setupModel.cards.size - 1
                        );
                        const competitorsChannel = client.channels.cache.get(
                            config.competitorsChannelID
                        );
                        competitorsChannel.messages
                            .fetch(setupModel.messageID)
                            .then((message) => {
                                // Card Brawl is full
                                if (setupModel.cards.size === setupModel.size) {
                                    updatedEmbed.setColor(config.red);
                                    updatedEmbed.setFooter({
                                        text: "This Card Brawl is full!",
                                    });
                                    message.edit({
                                        content: `This \`${setupModel.name}\` Card Brawl is full! 🥊 <@&${config.competitorRole}>`,
                                        embeds: [updatedEmbed],
                                    });
                                } else {
                                    message.edit({
                                        content: `Type \`/brawl enter ${name}\` to join this Card Brawl! 🥊 <@&${config.competitorRole}>`,
                                        embeds: [updatedEmbed],
                                    });
                                }
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
                            content:
                                "Is this the correct card you want to submit?",
                            embeds: [cardEmbed],
                            components: [],
                        });
                        return await channel.send({
                            content: error.message,
                            allowedMentions: { parse: [] },
                        });
                    }

                    cardEmbed.setColor(config.green);
                    await confirmation.update({
                        content: "Is this the correct card you want to submit?",
                        embeds: [cardEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            return await response.reply({
                content:
                    "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};
