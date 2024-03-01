const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} = require("discord.js");
const CardAdsModel = require("../../../sell/schemas/cardAdSchema");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("sell")
        .setDescription(
            "List a card for sale. The card's print number must be less than or equal to #999."
        )
        .addStringOption((option) =>
            option.setName("code").setDescription("Card's unique code.").setRequired(true)
        ),
    category: "public/card",
    async execute(interaction) {
        const userID = interaction.user.id;
        const code = interaction.options.getString("code");
        const channel = client.channels.cache.get(config.channelID.cardAds);

        // Ask for card details
        await interaction.reply({
            content: `<@${userID}>, show the card info for what you want to sell. Type command \`kci ${code}\`.`,
            allowedMentions: { parse: [] },
        });

        // Collect card details embed message
        let collected;
        try {
            collected = await interaction.channel.awaitMessages({
                filter: (response) =>
                    response.author.id === config.botID.karuta &&
                    response.channelId === interaction.channel.id &&
                    response.mentions.repliedUser &&
                    response.mentions.repliedUser.id === userID &&
                    response.embeds.length === 1 &&
                    response.embeds[0].data.title === "Card Details" &&
                    response.embeds[0].data.description.includes("Dropped in server ID"),
                max: 1,
                time: 60 * 1000,
            });

            if (collected.size === 0) {
                console.warn(`[WARN] [sell] Command timed out:`, interaction.user.tag);
                return await interaction.followUp({
                    content:
                        "❌ Card info command not received within `1 minute`, cancelling.",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error(`[ERROR] [sell]:`, error);
            return await interaction.followUp({
                content: "❌ An error occurred.",
                ephemeral: true,
            });
        }

        // Acquire card details embed
        console.log(`[INFO] [sell] Found card details embed for:`, interaction.user.tag);
        let embedMessage;
        try {
            embedMessage = collected.first();
        } catch (error) {
            return await interaction.followUp({
                content: "❌ Card info not found.",
                ephemeral: true,
            });
        }
        const cardDetailsEmbed = embedMessage.embeds[0].data;

        // Parse the card details
        const lines = cardDetailsEmbed.description.split("\n");

        let info = lines[0].split(" · ");

        // Check if card code is the same as before
        if (code !== info[0].slice(3, -3)) {
            return await embedMessage.reply({
                content: `❌ <@${userID}>, mismatching card codes.`,
                allowedMentions: { parse: [] },
            });
        }

        const print = parseInt(info[2].slice(2, -1));
        const edition = parseInt(info[3].slice(2, -1));
        const series = info[4].replace(/~~/, "");
        const character = parseCharacter(info[5].replace(/~~/, "").replace(/\*/g, ""));

        info = lines[9].split(" ");
        const condition = info[2].replace(/\*/g, "");

        // Check card print number precondition
        if (print > 999) {
            return await embedMessage.reply({
                content: `❌ <@${userID}>, the card's print number must be less than or equal to #999.`,
                allowedMentions: { parse: [] },
            });
        }

        // Check if user owns the card
        if (!cardDetailsEmbed.description.includes(`Owned by <@${userID}>`)) {
            return await embedMessage.reply({
                content: `❌ <@${userID}>, you must own the card to sell it.`,
                allowedMentions: { parse: [] },
            });
        }

        // Ask for worker info
        await embedMessage.reply({
            content: `<@${userID}>, show the worker info for what you want to sell. Type command \`kwi ${code}\`.`,
            allowedMentions: { parse: [] },
        });

        // Collect worker info embed message
        try {
            collected = await interaction.channel.awaitMessages({
                filter: (response) =>
                    response.author.id === config.botID.karuta &&
                    response.channelId === interaction.channel.id &&
                    response.mentions.repliedUser &&
                    response.mentions.repliedUser.id === userID &&
                    response.embeds.length === 1 &&
                    response.embeds[0].data.title === "Worker Details",
                max: 1,
                time: 60 * 1000,
            });

            if (collected.size === 0) {
                console.warn(`[WARN] [sell] Command timed out:`, interaction.user.tag);
                return await interaction.followUp({
                    content:
                        "❌ Worker info command not received within `1 minute`, cancelling.",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error(`[ERROR] [sell]:`, error);
            return await interaction.followUp({
                content: "❌ An error occurred.",
                ephemeral: true,
            });
        }

        // Acquire worker info embed
        console.log(`[INFO] [sell] Found worker info embed for:`, interaction.user.tag);
        try {
            embedMessage = collected.first();
        } catch (error) {
            return await interaction.followUp({
                content: "❌ Card info not found.",
                ephemeral: true,
            });
        }
        const cardWorkerEmbed = embedMessage.embeds[0].data;

        // Parse the card code
        const regexCardCode = /`([^`]+)`/;
        const matchWorkerCardCode = regexCardCode.exec(cardWorkerEmbed.description);
        if (!matchWorkerCardCode) {
            console.error(`[ERROR] [sell] Couldn't finding card code`);
            return await embedMessage.reply(`❌ Error finding card code.`);
        }

        // Check if card code is the same as before
        if (code !== matchWorkerCardCode[1]) {
            return await embedMessage.reply({
                content: `❌ <@${userID}>, mismatching card codes.`,
                allowedMentions: { parse: [] },
            });
        }

        const regexToughness = /\((\w)\) Toughness/;
        const toughness = regexToughness.exec(cardWorkerEmbed.description)[1];
        const regexQuickness = /\((\w)\) Quickness/;
        const quickness = regexQuickness.exec(cardWorkerEmbed.description)[1];

        // Ask for want tags
        const select = new StringSelectMenuBuilder()
            .setCustomId("tagsSelect")
            .setPlaceholder("Select currencies")
            .setMinValues(1)
            .setMaxValues(3)
            .addOptions(
                {
                    label: "Cards",
                    value: "♻️",
                    emoji: "♻️", // Unicode representation of the recycle emoji
                },
                {
                    label: "Tickets",
                    value: "🎟️",
                    emoji: "🎟️", // Unicode representation of the tickets emoji
                },
                {
                    label: "Gems",
                    value: "💎",
                    emoji: "💎", // Unicode representation of the gems emoji
                }
            );
        const selectRow = new ActionRowBuilder().addComponents(select);

        const selectEmbed = new EmbedBuilder()
            .setTitle("Card Sell")
            .setDescription(`What currencies are you accepting for \`${code}\`?`);
        const selectResponse = await interaction.followUp({
            embeds: [selectEmbed],
            components: [selectRow],
        });

        // Wait for color role selection
        try {
            const collector = await selectResponse.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === userID,
                max: 1,
                time: 60_000,
            });

            collector.on("end", async (collected, reason) => {
                if (reason === "time") {
                    selectEmbed.setColor(config.embed.red);
                    await interaction.followUp({
                        content:
                            "❌ Currencies not selected within `1 minute`, cancelling.",
                        ephemeral: true,
                    });
                }

                return await selectResponse.edit({
                    embeds: [selectEmbed],
                    components: [],
                });
            });

            collector.on("collect", async (i) => {
                const tags = i.values.sort().join(" ");

                // Mark select embed as success
                selectEmbed.setColor(config.embed.green);
                await i.update({
                    embeds: [selectEmbed],
                    components: [],
                });

                // Format info for post
                const conditionText = getConditionText(condition);
                const quicknessText = getQuicknessText(quickness);
                const toughnessText = getToughnessText(toughness);
                const { printPrefix, printText } = getPrintText(print);

                // Create buttons
                const confirm = new ButtonBuilder()
                    .setCustomId("confirmEnter")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success);
                const cancel = new ButtonBuilder()
                    .setCustomId("cancelEnter")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger);
                const row = new ActionRowBuilder().addComponents(cancel, confirm);

                // Display card confirmation
                const cardImage = cardDetailsEmbed.thumbnail.url;
                const cardEmbed = new EmbedBuilder()
                    .setTitle(`E${edition} ${printPrefix} ${character}`)
                    .setDescription(
                        `Owned by <@${userID}>\n\n` +
                            `\`${code}\` · \`#${print}\` · \`◈${edition}\` · ${series} · **${character}**`
                    )
                    .addFields(
                        {
                            name: `Effort Modifiers`,
                            value:
                                `\`\`\`diff\n` +
                                `${conditionText}\n` +
                                `${quicknessText}\n` +
                                `${toughnessText}\n` +
                                `\`\`\``,
                            inline: true,
                        },
                        {
                            name: `Tags`,
                            value:
                                `${tags}\`\`\`\n` +
                                `  (E${edition}) Edition ${edition}\n` +
                                `  ${printText}\n` +
                                `\`\`\``,
                            inline: true,
                        }
                    )
                    .setColor(cardDetailsEmbed.color)
                    .setImage(cardImage);

                const confirmationResponse = await interaction.channel.send({
                    content: `<@${userID}>, is this the correct card you want to sell?`,
                    allowedMentions: { parse: [] },
                    embeds: [cardEmbed],
                    components: [row],
                });

                // Collect button press interaction
                let confirmation;
                try {
                    confirmation = await confirmationResponse.awaitMessageComponent({
                        filter: (i) => i.user.id === userID,
                        max: 1,
                        time: 60 * 1000,
                    });
                } catch (error) {
                    console.warn(
                        `[WARN] [sell] Command timed out:`,
                        interaction.user.tag
                    );

                    cardEmbed.setColor(config.embed.red);
                    await confirmationResponse.edit({
                        content: `<@${userID}>, is this the correct card you want to submit?`,
                        allowedMentions: { parse: [] },
                        embeds: [cardEmbed],
                        components: [],
                    });

                    return await interaction.followUp({
                        content:
                            "❌ Confirmation not received within `1 minute`, cancelling.",
                        ephemeral: true,
                    });
                }

                // Button press outcome
                switch (confirmation.customId) {
                    case "cancelEnter": {
                        cardEmbed.setColor(config.embed.red);
                        return await confirmation.update({
                            content: `<@${userID}>, is this the correct card you want to sell?`,
                            embeds: [cardEmbed],
                            components: [],
                            allowedMentions: { parse: [] },
                        });
                    }
                    case "confirmEnter": {
                        const message = await channel.send({ embeds: [cardEmbed] });

                        const task = async () => {
                            // Fetch existing card ad model
                            const cardAdsModel = await CardAdsModel.findOne({
                                code,
                            }).exec();

                            // Duplicate listing found
                            if (cardAdsModel) {
                                // Fetch card ad message to delete
                                try {
                                    const messageToDelete = await channel.messages.fetch(
                                        cardAdsModel.messageID
                                    );

                                    await messageToDelete.delete();
                                    console.log(
                                        `[INFO] [sell] Deleted messageID:`,
                                        cardAdsModel.messageID
                                    );
                                } catch (error) {}

                                // Update listing message id
                                cardAdsModel.messageID = message.id;
                                cardAdsModel.ownerID = userID;
                                await cardAdsModel.save();
                            } else {
                                // Didn't exist, create a model
                                const cardAdSchema = new CardAdsModel({
                                    code: code,
                                    messageID: message.id,
                                    ownerID: userID,
                                    timestamp: Math.floor(new Date().getTime() / 1000),
                                });
                                await cardAdSchema.save();
                            }
                        };

                        // Enqueue task
                        try {
                            await client.cardAdsQueue.enqueue(task);
                        } catch (error) {
                            console.log(`[ERROR] [sell]:`, error);

                            cardEmbed.setColor(config.embed.red);
                            return await confirmation.update({
                                content: `<@${userID}>, is this the correct card you want to sell?`,
                                embeds: [cardEmbed],
                                components: [],
                                allowedMentions: { parse: [] },
                            });
                        }

                        await interaction.channel.send(
                            `✅ Successfully listed \`${code}\` for sale in <#${config.channelID.cardAds}>!`
                        );

                        cardEmbed.setColor(config.embed.green);
                        await confirmation.update({
                            content: `<@${userID}>, is this the correct card you want to sell?`,
                            embeds: [cardEmbed],
                            components: [],
                            allowedMentions: { parse: [] },
                        });
                        break;
                    }
                }
                console.log(
                    `[INFO] [sell] Successfully listed ${code} for sale:`,
                    interaction.user.tag
                );
            });
        } catch (error) {
            console.error("[ERROR] [sell]:", error);
            return await interaction.followUp({
                content: "❌ Currency tags not selected within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};

function parseCharacter(input) {
    // Check if the input contains "alias of"
    if (input.includes("(alias of")) {
        const regexAlias = /\(alias of (.+?)\)/;

        // Extract the name within parentheses using the regular expression
        const match = input.match(regexAlias);
        if (match) {
            return match[1].trim(); // Return the trimmed name
        }
    }

    // No alias, return the original
    return input;
}

function getConditionText(condition) {
    let conditionText;
    switch (condition) {
        case "mint":
            conditionText = `+ (S) Dropped Mint`;
            break;
        case "excellent":
            conditionText = `  (A) Dropped Excellent`;
            break;
        case "good":
            conditionText = `  (B) Dropped Good`;
            break;
        case "poor":
            conditionText = `- (C) Dropped Poor`;
            break;
        case "damaged":
            conditionText = `- (F) Dropped Damaged`;
            break;
    }
    return conditionText;
}

function getQuicknessText(quickness) {
    let quicknessText;
    switch (quickness) {
        case "S":
            quicknessText = `+ (S) Quickness`;
            break;
        case "A":
            quicknessText = `+ (A) Quickness`;
            break;
        case "B":
            quicknessText = `  (B) Quickness`;
            break;
        case "C":
            quicknessText = `  (C) Quickness`;
            break;
        case "D":
            quicknessText = `  (D) Quickness`;
            break;
        case "F":
            quicknessText = `  (F) Quickness`;
            break;
    }
    return quicknessText;
}

function getToughnessText(toughness) {
    let toughnessText;
    switch (toughness) {
        case "S":
            toughnessText = `+ (S) Toughness`;
            break;
        case "A":
            toughnessText = `+ (A) Toughness`;
            break;
        case "B":
            toughnessText = `  (B) Toughness`;
            break;
        case "C":
            toughnessText = `  (C) Toughness`;
            break;
        case "D":
            toughnessText = `  (D) Toughness`;
            break;
        case "F":
            toughnessText = `  (F) Toughness`;
            break;
    }
    return toughnessText;
}

function getPrintText(print) {
    let printPrefix, printText;
    if (print >= 100) {
        printPrefix = "MP";
        printText = "(MP) Mid Print";
    } else if (print >= 10) {
        printPrefix = "LP";
        printText = "(LP) Low Print";
    } else {
        printPrefix = "SP";
        printText = "(SP) Single Print";
    }
    return { printPrefix, printText };
}
