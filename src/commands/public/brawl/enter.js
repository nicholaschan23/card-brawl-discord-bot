const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const config = require("../../../../config.json");
const client = require("../../../index");
const { getEnterEmbed } = require("../../../functions/embeds/brawlEnter");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("enter")
        .setDescription("Enter a card competition.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Card brawl name you will be entering.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const { formatTitle } = require("../../../functions/formatTitle");
        const name = formatTitle(interaction.options.getString("name"));
        const channel = client.channels.cache.get(interaction.channel.id);
        let message;

        // Find brawl setup in database
        let setupModel;
        try {
            setupModel = await BrawlSetupModel.findOne({ name }).exec();
            if (!setupModel) {
                interaction.reply(`No brawl found with the name "${name}".`);
                return;
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            interaction.reply(`There was an error retrieving the brawl.`);
            return;
        }

        // Check preconditions
        if (setupModel.cards.size === setupModel.size) {
            await interaction.reply(
                `The **${setupModel.name}** card brawl is full!`
            );
            return;
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
                        await interaction.reply({
                            content: `You already entered **2 cards** for the **${setupModel.name}** Card Brawl.`,
                        });
                        return;
                    }
                } else {
                    await interaction.reply({
                        content: `You already entered a card for the **${setupModel.name}** Card Brawl.
                        Become a <@&1152082378563534922> to submit **2 cards**!`,
                        allowedMentions: [],
                    });
                    return;
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
            content: "Is this the correct card brawl you want to enter?",
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
                    await confirmation.update({
                        content:
                            "Is this the correct card brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                    return;
                }
                case "confirmEnter": {
                    enterEmbed.setColor(config.green);
                    await confirmation.update({
                        content:
                            "Is this the correct card brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            await interaction.followUp(
                "Confirmation not received within 1 minute, cancelling."
            );
            return;
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
            await message.reply({
                content:
                    "Card details not received within 1 minute, cancelling.",
                ephemeral: true,
            });
            return;
        }

        // Find first match of regex to extract card code
        // Define a regular expression to match the content between backticks
        // Use the `exec` method to find the first match
        const regex = /`([^`]+)`/;
        const match = regex.exec(botResponseEmbed.description);
        if (!match) {
            await embedMessage.reply(
                `Error finding card code between backticks: ${cardCode}`
            );
            return;
        }
        const cardCode = match[1];
        // Check precondition
        if (setupModel.cards.get(cardCode)) {
            await embedMessage.reply(
                "This card is already submitted to this brawl."
            );
            return;
        }
        const cardImage = await botResponseEmbed.thumbnail.url; // Alternative is .proxy_url

        // Check card requirements
        if (!description.includes(`Owned by <@${interaction.user.id}>`)) {
            await embedMessage.reply("You do not own this card.");
            return;
        } else if (!description.includes(`Framed with`)) {
            await embedMessage.reply("This card is not framed.");
            return;
        } else if (!description.includes(`Morphed by`)) {
            await embedMessage.reply("This card is not morphed.");
            return;
        } else if (description.includes(`Sketched by`)) {
            await embedMessage.reply("This card is sketched.");
            return;
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
                    await confirmation.update({
                        content: "Is this the correct card you want to submit?",
                        embeds: [cardEmbed],
                        components: [],
                    });
                    return;
                }
                case "confirmEnter": {
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
            await response.reply({
                content:
                    "Confirmation not received within 1 minute, cancelling.",
                ephemeral: true,
            });
            return;
        }

        // Add card to the brawl in database
        try {
            const imageSchema = {
                imageLink: cardImage,
                userID: interaction.user.id,
            };
            if (setupModel.entries.get(interaction.user.id)) {
                setupModel.entries.get(interaction.user.id).push(cardCode);
            } else {
                setupModel.entries.set(interaction.user.id, [cardCode]);
            }
            setupModel.cards.set(cardCode, imageSchema);
            await setupModel.save();
            await channel.send(
                `Successfully submitted \`${cardCode}\` to the **${setupModel.name}** card brawl!`
            );
        } catch (error) {
            await channel.send(
                `Error submitting \`${cardCode}\` to the **${setupModel.name}** card brawl...`
            );
            console.error("Error submitting card:", error);
        }

        // Card Brawl is full
        if (setupModel.cards.size === setupModel.size) {
            // Update announcement embed
            const announcementChannel = client.channels.cache.get(
                config.announcementChannelID
            );
            announcementChannel.messages
                .fetch(setupModel.messageID)
                .then((message) => {
                    const updatedEmbed = new EmbedBuilder(message.embeds[0]);
                    updatedEmbed.setColor(config.red);
                    updatedEmbed.setFooter({
                        text: "This Card Brawl is full!",
                    });
                    message.edit({ embeds: [updatedEmbed] });
                });

            // Create guild scheduled event
        }
    },
};
