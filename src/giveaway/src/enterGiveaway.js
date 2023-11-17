const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");
const getTokenHelpEmbed = require("../../help/embeds/tokenHelp");
const gconfig = require("../giveaway-config.json");
const config = require("../../../config.json");
const client = require("../../index");
const GiveawayModel = require("../schemas/giveawaySchema");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");

const bonusRoles = {
    "Server Subscriber": gconfig.serverSubscriberCap,
    "Active Booster": gconfig.activeBoosterCap,
    "Server Booster": gconfig.serverBoosterCap,
};

const getUserRoleValue = (member) => {
    const userRoles = member.roles.cache;

    for (const roleName in bonusRoles) {
        if (userRoles.some((role) => role.name === roleName)) {
            return bonusRoles[roleName];
        }
    }

    // If no matching role is found, return a default value
    return gconfig.everyoneCap;
};

async function enterGiveaway(interaction) {
    const userID = interaction.user.id;
    const inventory = await UserInventoryModel.findOne({ userID }).exec();

    // Inventory undefined
    if (!inventory) {
        await interaction.reply({
            content: `You need **1 ${config.emojiToken} Token** to enter this giveaway!`,
            embeds: [getTokenHelpEmbed()],
            ephemeral: true,
        });
        console.log(`[INFO] [enterGiveaway] No inventory found:`, userID)
        return;
    }
    // No tokens
    if (inventory.numTokens === 0) {
        await interaction.reply({
            content: `You need **1 ${config.emojiToken} Token** to enter this giveaway!`,
            embeds: [getTokenHelpEmbed()],
            ephemeral: true,
        });
        console.log(`[INFO] [enterGiveaway] 0 tokens in inventory:`, userID)
        return;
    }
    // User has available balance (at least 1 token)
    const balance = inventory.numTokens;

    // Get user's max allowed entries
    const guild = interaction.guild;
    const member = await guild.members.fetch(userID);
    const maxEntries = getUserRoleValue(member);

    const messageID = interaction.message.id;
    const messageLink = `https://discord.com/channels/${config.guildID}/${interaction.channel.id}/${messageID}`;
    const giveaway = await GiveawayModel.findOne({ messageID }).exec();
    const currentEntries = giveaway.entries.get(userID) ?? 0;
    let amount = 0;

    // If already have max entries, display how to get more
    if (currentEntries === maxEntries) {
        let entries = `You have **${currentEntries} entries** in this giveaway.`;
        if (maxEntries === 1) {
            entries = `You have **1 entry** in this giveaway.`;
        }

        let upgrade = `Become a <@&${config.activeBoosterRole}> or <@&${config.serverSubscriberRole}> to enter more!`;
        if (maxEntries === gconfig.activeBoosterCap) {
            upgrade = `Become a <@&${config.serverSubscriberRole}> to enter more!`;
        } else if (maxEntries === gconfig.serverSubscriberCap) {
            upgrade = "You've entered the max amount of entries.";
        }

        const embed = new EmbedBuilder()
            .setTitle("Giveaway")
            .setDescription(entries + " " + upgrade)
            .setColor(config.blue);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
        console.log(`[INFO] [enterGiveaway] Already have max entries:`, userID)
        return;
    }

    // Concurrent save inventory model
    const inventoryTask = async () => {
        // Retrieve inventory
        const inventoryModel = await UserInventoryModel.findOne({
            userID,
        }).exec();

        // Check balance
        const balance = inventoryModel.numTokens;
        if (balance < amount) {
            console.log(`[INFO] [enterGiveaway] Insufficient balance:`, userID)
            throw new Error(`You don't have enough **${config.emojiToken} Tokens**.`);
        }

        // Update balance
        inventoryModel.numTokens -= amount;

        await inventoryModel.save();
    };

    // Concurrent save giveaway model
    const giveawayTask = async () => {
        const giveawayModel = await GiveawayModel.findOne({
            messageID,
        }).exec();

        // Enter giveaway
        giveawayModel.entries.set(userID, amount + currentEntries);

        // Update button label
        const message = await interaction.channel.messages.fetch(messageID);
        const row = ActionRowBuilder.from(message.components[0]);
        row.components[0].setLabel(`${giveawayModel.entries.size}`);
        message.edit({ components: [row] });

        await giveawayModel.save();
    };

    // If not entered yet, user has available balance, and only allowed 1 entry -> automatically enter
    if (currentEntries === 0 && balance >= 1 && maxEntries === 1) {
        amount = 1;
        try {
            await client.inventoryQueue.enqueue(inventoryTask);
            await client.giveawayQueue.enqueue(giveawayTask);
        } catch (error) {
            console.error(error)
            await interaction.reply({
                content: error.message,
                ephemeral: true,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Giveaway")
            .setDescription(
                `Success! Your **1 entry** for this [giveaway](${messageLink}) is confirmed!`
            )
            .setColor(config.green);

        await interaction.reply({ embeds: [embed], ephemeral: true });
        console.log(`[INFO] [enterGiveaway] Successfully entered giveaway (${amount}):`, userID)
        return;
    }

    // Can enter multiple entries
    const modal = new ModalBuilder().setCustomId("giveawayEnterlModal").setTitle("Giveaway Entry");

    // Create the text input components
    const maxIn = maxEntries - currentEntries;
    const entryAmount = new TextInputBuilder()
        .setCustomId("entryAmount")
        .setLabel(`How many entries would you like to add?`)
        .setValue(`${maxIn}`)
        .setPlaceholder(`Current entries: ${currentEntries} | Entry limit: ${maxEntries}`)
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(1)
        .setRequired(true);
    const actionRow = new ActionRowBuilder().addComponents(entryAmount);

    // Add inputs to the modal
    modal.addComponents(actionRow);
    await interaction.showModal(modal);

    // Collect a modal submit interaction
    await interaction
        .awaitModalSubmit({ filter: (i) => i.customId === "giveawayEnterlModal", time: 60_000 })
        .then(async (i) => {
            amount = i.fields.getTextInputValue("entryAmount");
            if (isNaN(amount)) {
                await i.reply({ content: "Please enter a number.", ephemeral: true });
                return;
            }
            amount = parseInt(amount);

            if (amount === 0) {
                await i.reply({ content: "Please enter a number greater than **0**.", ephemeral: true });
                return;
            }

            if (amount > maxIn) {
                await i.reply({
                    content: `You can have up to **${maxEntries}** entries but currently have **${currentEntries}**. Please insert an amount that is less than or equal to **${maxIn}**.`,
                    ephemeral: true,
                });
                return;
            }

            if (amount > balance) {
                await i.reply({
                    content: `You don't have **${amount} ${config.emojiToken} Tokens**.`,
                    ephemeral: true,
                });
                return;
            }

            // Buttons
            const cancel = new ButtonBuilder()
                .setCustomId("cancelEnterGiveaway")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary);
            const confirm = new ButtonBuilder()
                .setCustomId("confirmEnterGiveaway")
                .setEmoji(config.emojiToken)
                .setLabel(`${amount}`)
                .setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder().addComponents(cancel, confirm);

            const embed = new EmbedBuilder()
                .setTitle("Giveaway")
                .setDescription(
                    `Would you like to exchange **${amount} ${
                        config.emojiToken
                    } Tokens** to have a total of **${amount + currentEntries}** entries?`
                );
            const response = await i.reply({
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
                        case "cancelEnterGiveaway": {
                            embed.setColor(config.red);
                            await i.update({
                                embeds: [embed],
                                components: [],
                            });
                            return;
                        }
                        case "confirmEnterGiveaway": {
                            // Place task in concurrency queue
                            try {
                                await client.inventoryQueue.enqueue(inventoryTask);
                                await client.giveawayQueue.enqueue(giveawayTask);
                            } catch (error) {
                                embed.setColor(config.red);
                                await i.update({
                                    embeds: [embed],
                                    components: [],
                                });

                                await interaction.followUp({
                                    content: error.message,
                                    ephemeral: true,
                                });
                                return;
                            }

                            embed.setColor(config.green);
                            await i.update({
                                embeds: [embed],
                                components: [],
                            });

                            const successEmbed = new EmbedBuilder()
                                .setTitle("Giveaway")
                                .setDescription(
                                    `Success! Your **${
                                        amount + currentEntries
                                    } entries** for this [giveaway](${messageLink}) are confirmed!`
                                )
                                .setColor(config.green);

                            await interaction.followUp({
                                embeds: [successEmbed],
                                ephemeral: true,
                            });
                            console.log(`[INFO] [enterGiveaway] Successfully entered giveaway (${amount}):`, userID)
                            return;
                        }
                    }
                });
            } catch (error) {}
        })
        .catch(console.error);
}

module.exports = enterGiveaway;
