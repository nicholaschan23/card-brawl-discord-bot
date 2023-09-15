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

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("enter")
        .setDescription("Enter a card brawl.")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Card brawl name you will be entering.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = client.channels.cache.get(interaction.channel.id);
        let message;

        let name = interaction.options.getString("name");
        name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;

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
            await interaction.reply(`The **${setupModel.name}** card brawl is full!`);
            return;
        }
        // TODO: Check if user is eligible for multiple entries
        if (interaction.user.id !== config.developerID) {
            // Debugging
            if (data.entries.get(interaction.user.id)) {
                // const cards = entries.get(userID).size();
                await interaction.reply( {
                    content: `You already entered a card for the **${setupModel.name}** card brawl.`,
                    allowedMentions: []
                }
                );
                return;
            }
        }

        // Confirm correct brawl data
        const enterEmbed = new EmbedBuilder()
            .setColor(config.blue)
            .setTitle("Enter Card Brawl")
            .addFields(
                {
                    name: "Name:",
                    value: `${setupModel.name}`,
                },
                { name: "Theme:", value: `${setupModel.theme}` },
                {
                    name: "Status:",
                    value: `${setupModel.entries.size}/${setupModel.size} spots filled`,
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
                time: 30000,
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
            await interaction.followUp(config.cancel30);
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
                time: 30000,
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
            await message.reply(config.cancel30);
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
            await embedMessage.reply("This card is already in this brawl.");
            return;
        }
        const cardImage = botResponseEmbed.thumbnail.proxy_url; // Alternative is .proxy_url

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
                time: 30000,
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
            await response.reply(config.cancel30);
            return;
        }

        // Add card to the brawl in database
        try {
            const imageSchema = {
                imageLink: cardImage,
                userID: interaction.user.id,
            };
            setupModel.entries.set(interaction.user.id, [cardCode]);
            setupModel.cards.set(cardCode, imageSchema);
            await setupModel.save();
            await channel.send(
                `Successfully submitted \`${cardCode}\` to the **${setupModel.name}** card brawl!`
            );
        } catch (error) {
            console.error("Error submitting card:", error);
        }
    },
};
