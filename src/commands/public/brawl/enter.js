const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const config = require("../../../../config.json");

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
        const name = interaction.options.getString("name");

        // Find brawl setup in database
        let data;
        try {
            data = await BrawlSetupModel.findOne({ name }).exec();
            if (!data) {
                interaction.reply(`No brawl found with the name "${name}".`);
                return;
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            interaction.reply(`There was an error retrieving the brawl.`);
            return;
        }

        // Check preconditions
        if (data.cards.size === data.size) {
            await interaction.reply("This card brawl is full!");
            return;
        }
        // TODO: Check if user is eligible for multiple entries
        if (data.entries.get(interaction.user.id)) {
            // const cards = entries.get(userID).size();
            await interaction.reply(
                "You already entered a card for this brawl."
            );
            return;
        }

        // Confirm correct brawl data
        const enterEmbed = new EmbedBuilder()
            .setColor(config.blue)
            .setTitle("Enter Card Brawl")
            .addFields(
                {
                    name: "Name:",
                    value: `${data.name}`,
                },
                { name: "Theme:", value: `${data.theme}` },
                {
                    name: "Status:",
                    value: `${data.entries.size}/${data.size} spots filled`,
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
            await interaction.followUp(
                "No response received within 30 seconds. Cancelling."
            );
            return;
        }
        await interaction.followUp(
            "Show the card you want to submit: `kci <card code>`"
        );

        // Read card details embed
        const botResponseFilter = (response) =>
            response.author.id === config.karutaID &&
            response.channelId === interaction.channel.id &&
            response.mentions.repliedUser.id === interaction.user.id;
        let botResponseEmbed;
        try {
            const collected = await interaction.channel.awaitMessages({
                max: 1,
                time: 30000,
                errors: ["time"],
                filter: botResponseFilter,
            });

            if (collected.first()) {
                // console.log(collected.first());
                try {
                    botResponseEmbed = collected.first().embeds[0].data;
                    if (botResponseEmbed.title !== "Card Details") {
                        await interaction.followUp(
                            "Embed found. Wrong command."
                        );
                        return;
                    }
                } catch (error) {
                    await interaction.followUp("Embed not found.");
                    return;
                }
            } else {
                await interaction.followUp("No response found.");
                return;
            }
        } catch (error) {
            console.log("Error while waiting for response:", error);
            await interaction.followUp(
                "No response received within 30 seconds. Cancelling."
            );
            return;
        }

        // Find first match of regex to extract card code
        // Define a regular expression to match the content between backticks
        // Use the `exec` method to find the first match
        const regex = /`([^`]+)`/;
        const match = regex.exec(botResponseEmbed.description);
        if (!match) {
            await interaction.followUp(
                `Error finding card code between backticks: ${cardCode}`
            );
            return;
        }
        const cardCode = match[1];
        // Check precondition
        if (data.cards.get(cardCode)) {
            await interaction.followUp("This card is already in this brawl.");
            return;
        }
        const cardImage = botResponseEmbed.thumbnail.url; // Alternative is .proxy_url

        // Check card requirements
        const description = botResponseEmbed.description;
        if (!description.includes(`Owned by <@${interaction.user.id}>`)) {
            await interaction.followUp("You do not own this card.");
            return;
        } else if (!description.includes(`Framed with`)) {
            await interaction.followUp("This card is not framed.");
            return;
        } else if (!description.includes(`Morphed by`)) {
            await interaction.followUp("This card is not morphed.");
            return;
        }        

        // Display card confirmation
        const cardEmbed = new EmbedBuilder()
            .setColor(botResponseEmbed.color)
            .setImage(cardImage);
        response = await interaction.followUp({
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
            await interaction.followUp(
                "No response received within 30 seconds. Cancelling."
            );
            return;
        }

        // Add card to the brawl in database
        try {
            const cardInfo = {
                imageLink: cardImage,
                userID: interaction.user.id,
            };
            data.entries.set(interaction.user.id, [cardCode]);
            data.cards.set(cardCode, cardInfo);
            data.save();
            await interaction.followUp(
                `Successfully submitted \`${cardCode}\` to the **${data.name}** card brawl!`
            );
            
        } catch (error) {
            console.error("Error submitting card:", error);
        }
    },
};
