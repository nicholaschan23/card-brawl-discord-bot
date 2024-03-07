const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    ModalBuilder,
    SlashCommandSubcommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const CardAdsModel = require("../../../sell/schemas/cardAdSchema");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("offer")
        .setDescription("Send an offer for a card.")
        .addStringOption((option) =>
            option.setName("code").setDescription("Card's unique code.").setRequired(true)
        ),
    category: "public/card",
    async execute(interaction) {
        const code = interaction.options.getString("code").toLowerCase();
        const adChannel = client.channels.cache.get(config.channelID.cardAds);
        const offersChannel = client.channels.cache.get(config.channelID.cardOffers);

        // Validate card code
        const regexCode = /[^a-z0-9]/;
        if (regexCode.test(code)) {
            return await interaction.reply({
                content: `❌ ${interaction.user}, that is not a valid card code: \`${code}\``,
                allowedMentions: { parse: [] },
                ephemeral: true,
            });
        }

        // Make sure card exists to offer
        let messageID, ownerID;
        const task = async () => {
            // Fetch existing card ad model
            const cardAdsModel = await CardAdsModel.findOne({
                code,
            }).exec();

            // Listing not found
            if (!cardAdsModel) {
                throw new Error(
                    `❌ The \`${code}\` card is not listed in <#${config.channelID.cardAds}>.`
                );
            }

            if (cardAdsModel.ownerID === interaction.user.id) {
                throw new Error(`❌ You cannot offer for your own card.`);
            }

            messageID = cardAdsModel.messageID;
            ownerID = cardAdsModel.ownerID;
        };

        // Enqueue task
        try {
            await client.cardAdsQueue.enqueue(task);
        } catch (error) {
            return await interaction.reply({ content: error.message, ephemeral: true });
        }

        // Get data from embed
        let embedTitle, cardDetails;
        await adChannel.messages.fetch(messageID).then((message) => {
            embedTitle = message.embeds[0].data.title;
            cardDetails = message.embeds[0].data.description.split("\n")[2];
        });

        const gemOffer = new TextInputBuilder()
            .setCustomId("gemOffer")
            .setLabel(`Gems`)
            .setPlaceholder(`15`)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(6)
            .setRequired(false);
        const ticketOffer = new TextInputBuilder()
            .setCustomId("ticketOffer")
            .setLabel(`Tickets`)
            .setPlaceholder(`1`)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(6)
            .setRequired(false);
        const cardOffer = new TextInputBuilder()
            .setCustomId("cardOffer")
            .setLabel(`Cards`)
            .setPlaceholder(`◾ ♡999 · abc123 · ★★★★ · #999 · ◈1 · Series · Character`)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);
        const gemRow = new ActionRowBuilder().addComponents(gemOffer);
        const ticketRow = new ActionRowBuilder().addComponents(ticketOffer);
        const cardRow = new ActionRowBuilder().addComponents(cardOffer);

        // Add inputs to the modal
        const modal = new ModalBuilder()
            .setCustomId("offerModal")
            .setTitle(`${embedTitle}`);
        modal.addComponents(gemRow, ticketRow, cardRow);

        await interaction.showModal(modal).catch((error) => {
            return console.error(
                `[ERROR] [offer] Failed to send modal to: ${interaction.user.tag}`,
                error
            );
        });

        // Collect a modal submit interaction
        const regexValidNum = /^[1-9]\d*$/;
        await interaction
            .awaitModalSubmit({
                filter: (i) => i.customId === "offerModal",
                time: 60_000,
            })
            .then(async (i) => {
                let inventoryOffer = "",
                    cardOffer = "";

                await i.deferReply({ ephemeral: true });

                // Validate gem offer
                let gemAmount = i.fields.getTextInputValue("gemOffer");
                if (gemAmount) {
                    console.log(regexValidNum.test(gemAmount));
                    // Only accept whole positive number
                    if (!regexValidNum.test(gemAmount)) {
                        return await i.editReply({
                            content: "❌ Please enter a valid number of gems.",
                            ephemeral: true,
                        });
                    }
                    inventoryOffer += `💎 **${gemAmount}**`;
                }

                // Validate ticket offer
                let ticketAmount = i.fields.getTextInputValue("ticketOffer");
                if (ticketAmount) {
                    if (!regexValidNum.test(ticketAmount)) {
                        return await i.editReply({
                            content: "❌ Please enter a valid number of tickets.",
                            ephemeral: true,
                        });
                    }
                    inventoryOffer += `   🎟️ **${ticketAmount}**`;
                }

                // Validate card offer format
                let cards = i.fields.getTextInputValue("cardOffer");
                if (cards) {
                    cards = cards.split("\n");
                    for (let index = 0; index < cards.length; index++) {
                        let line = cards[index];
                        // Split the line by the '·' character and trim each part
                        const parts = line.split("·").map((part) => part.trim());

                        // Check if the number of parts matches the expected format
                        if (parts.length !== 7) {
                            return await i.editReply({
                                content: `❌ Invalid card format: \`${line}\``,
                                ephemeral: true,
                            });
                        }

                        // Check for wishlist and trim emoji
                        const wishlist = parts[0].match(/♡\d+/);
                        if (!wishlist) {
                            return await i.editReply({
                                content: `❌ No wishlist found. Invalid format: \`${line}\``,
                                ephemeral: true,
                            });
                        }
                        parts[0] = wishlist[0];

                        // Join the trimmed parts back together and store it back in line
                        cards[i] = parts.join(" · ");
                    }
                    cardOffer = `${`\`\`\`ls\n` + `${cards}\n` + `\`\`\``}`;
                }

                // Must have one of the 3 fields filled out
                if (!gemAmount && !ticketAmount && !cards) {
                    return await i.editReply({
                        content: "❌ Your offer cannot be empty.",
                        ephemeral: true,
                    });
                }

                const embed = new EmbedBuilder().addFields(
                    {
                        name: "Card",
                        value: `${cardDetails}`,
                    },
                    {
                        name: "Offer",
                        value: `${inventoryOffer.trim()}\n` + `${cardOffer}`,
                    }
                );

                // Buttons
                const cancel = new ButtonBuilder()
                    .setCustomId("cancelOffer")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary);
                const confirm = new ButtonBuilder()
                    .setCustomId("confirmOffer")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Secondary);
                const row = new ActionRowBuilder().addComponents(cancel, confirm);

                const response = await i.editReply({
                    fetchReply: true,
                    embeds: [embed],
                    components: [row],
                    ephemeral: true,
                });

                // Wait for confirmation
                try {
                    const collector = response.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        max: 1,
                        time: 60_000,
                    });

                    collector.on("collect", async (i) => {
                        switch (i.customId) {
                            case "cancelOffer": {
                                embed.setColor(config.embed.red);
                                return await i.update({
                                    embeds: [embed],
                                    components: [],
                                });
                            }
                            case "confirmOffer": {
                                const decline = new ButtonBuilder()
                                    .setCustomId("declineOffer")
                                    .setEmoji("❌")
                                    .setStyle(ButtonStyle.Secondary);
                                const accept = new ButtonBuilder()
                                    .setCustomId("acceptOffer")
                                    .setEmoji("✅")
                                    .setStyle(ButtonStyle.Secondary);
                                const row = new ActionRowBuilder().addComponents(
                                    decline,
                                    accept
                                );

                                await offersChannel.send({
                                    content: `<@${ownerID}>, an offer was sent to you by ${interaction.user}!`,
                                    embeds: [embed],
                                    components: [row],
                                });

                                embed.setColor(config.embed.green);
                                await i.update({
                                    embeds: [embed],
                                    components: [],
                                });

                                console.log(
                                    `[INFO] [offer] Successfully offered for ${code}:`,
                                    interaction.user.tag
                                );
                            }
                        }
                    });
                } catch (error) {
                    console.error("[ERROR] [offer]", error);
                    embed.setColor(config.embed.red);
                    return await i.update({
                        embeds: [embed],
                        components: [],
                    });
                }
            })
            .catch(console.error);
    },
};
