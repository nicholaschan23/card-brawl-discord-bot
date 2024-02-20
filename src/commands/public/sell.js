const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const client = require("../../index");
const config = require("../../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sell")
        .setDescription(
            "List a card for sale. The card's print number must be less than or equal to #999."
        )
        .addStringOption((option) =>
            option.setName("code").setDescription("Card's unique code.").setRequired(true)
        ),
    category: "public",
    cooldown: 60,
    async execute(interaction) {
        const userID = interaction.user.id;
        const code = interaction.options.getString("code");
        const postChannel = client.channels.cache.get(config.channelID.cardAds);

        // Ask for card details
        await interaction.reply({
            content: `<@${userID}>, show the card info for what you want to sell. \`\`\`kci ${code}\`\`\``,
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
        const print = parseInt(info[2].slice(2, -1));
        const edition = parseInt(info[3].slice(2, -1));
        const series = info[4];
        const character = info[5].slice(2, -2);

        info = lines[9].split(" ");
        const condition = info[2].slice(2, -2);

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

        // Ask for card work info
        await embedMessage.reply({
            content: `<@${userID}>, show the work info for the card you want to sell. \`\`\`kwi ${code}\`\`\``,
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

        //

        // Format info for post
        let conditionText;
        switch (condition) {
            case "mint":
                conditionText = `+ (S) Dropped Mint`;
                break;
            case "excellent":
                conditionText = `(A) Dropped Excellent`;
                break;
            case "good":
                conditionText = `(B) Dropped Good`;
                break;
            case "poor":
                conditionText = `- (C) Dropped Poor`;
                break;
            case "damaged":
                conditionText = `- (F) Dropped Damaged`;
                break;
        }

        let quicknessText;
        switch (quickness) {
            case "S":
                quicknessText = `+ (S) Quickness`;
                break;
            case "A":
                quicknessText = `+ (A) Quickness`;
                break;
            case "B":
                quicknessText = `(B) Quickness`;
                break;
            case "C":
                quicknessText = `(C) Quickness`;
                break;
            case "D":
                quicknessText = `(D) Quickness`;
                break;
            case "F":
                quicknessText = `(F) Quickness`;
                break;
        }

        let toughnessText;
        switch (toughness) {
            case "S":
                toughnessText = `+ (S) Toughness`;
                break;
            case "A":
                toughnessText = `+ (A) Toughness`;
                break;
            case "B":
                toughnessText = `(B) Toughness`;
                break;
            case "C":
                toughnessText = `(C) Toughness`;
                break;
            case "D":
                toughnessText = `(D) Toughness`;
                break;
            case "F":
                toughnessText = `(F) Toughness`;
                break;
        }

        let printPrefix;
        let printText;
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
                `${lines[6]}\n\n` +
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
                        `\`\`\`\n` +
                        `(E${edition}) Edition ${edition}\n` +
                        `${printText}\n` +
                        `\`\`\``,
                    inline: true,
                }
            )
            .setColor(cardDetailsEmbed.color)
            .setImage(cardImage);
        const response = await embedMessage.reply({
            content: `<@${userID}>, is this the correct card you want to sell?`,
            embeds: [cardEmbed],
            components: [row],
            allowedMentions: { parse: [] },
        });

        // Collect button press interaction
        try {
            confirmation = await response.awaitMessageComponent({
                filter: (i) => i.user.id === userID,
                max: 1,
                time: 60 * 1000,
            });
        } catch (error) {
            console.warn(`[WARN] [sell] Command timed out:`, interaction.user.tag);

            cardEmbed.setColor(config.embed.red);
            await response.edit({
                content: `<@${userID}>, is this the correct card you want to submit?`,
                embeds: [cardEmbed],
                components: [],
                allowedMentions: { parse: [] },
            });

            return await interaction.followUp({
                content: "❌ Confirmation not received within `1 minute`, cancelling.",
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
                await interaction.channel.send(
                    `✅ Successfully listed \`${code}\` for sale in <#${config.channelID.cardAds}>!`
                );

                await postChannel.send({ embeds: [cardEmbed] });

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
        console.log(`[INFO] [sell] Successfully listed ${code} for sale:`, interaction.user.tag);
    },
};
