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
const GiveawayModel = require("../schemas/giveawaySchema");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");
const getTokenHelpEmbed = require("../../help/embeds/tokenHelp");
const client = require("../../index");
const config = require("../../../config.json");

// Config variables
const everyoneCap = config.giveaway.everyoneCap;
const serverBoosterCap = config.giveaway.serverBoosterCap;
const activeBoosterCap = config.giveaway.activeBoosterCap;
const serverSubscriberCap = config.giveaway.serverSubscriberCap;
const red = config.embed.red;
const green = config.embed.green;
const blue = config.embed.blue;
const token = config.emoji.token;

const getUserRoleValue = (member) => {
    // Order matters, higher cap role first
    const bonusRoles = {
        "Server Subscriber": serverSubscriberCap,
        "Active Booster": activeBoosterCap,
        "Server Booster": serverBoosterCap,
    };
    const userRoles = member.roles.cache;

    for (const roleName in bonusRoles) {
        if (userRoles.some((role) => role.name === roleName)) {
            return bonusRoles[roleName];
        }
    }

    // If no matching role is found, return a default value
    return everyoneCap;
};

async function enterGiveaway(interaction) {
    const guild = interaction.guild;
    const userID = interaction.user.id;
    const userTag = interaction.user.tag;

    const inventory = await UserInventoryModel.findOne({ userID }).exec();
    const balance = inventory ? inventory.numTokens : 0;

    // Get user's max allowed entries
    const member = await guild.members.fetch(userID);
    const maxEntries = await getUserRoleValue(member);

    const messageID = interaction.message.id;
    const messageLink = `https://discord.com/channels/${config.guildID}/${interaction.channel.id}/${messageID}`;

    const giveaway = await GiveawayModel.findOne({ messageID }).exec();
    const currentEntries = giveaway.entries.get(userID) ?? 0;

    let amount = 0;

    // Concurrent save inventory model
    const inventoryTask = async () => {
        // Retrieve inventory
        const inventoryModel = await UserInventoryModel.findOne({
            userID,
        }).exec();

        // Check balance
        const balance = inventoryModel.numTokens;
        if (balance < amount) {
            console.log(`[INFO] [enterGiveaway] Insufficient balance:`, userTag);
            throw new Error(`You don't have enough **${token} Tokens**.`);
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

    // Check if user can enter multiple entries
    if (balance > 0 && currentEntries < maxEntries && userID !== giveaway.sponsor) {
        // Create the text input components
        const maxIn = maxEntries - currentEntries;
        const entryAmount = new TextInputBuilder()
            .setCustomId("entryAmount")
            .setLabel(`How many entries would you like to add?`)
            .setValue(`${maxIn}`)
            .setPlaceholder(
                `Current entries: ${currentEntries} | Entry limit: ${maxEntries}`
            )
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(1)
            .setRequired(true);
        const actionRow = new ActionRowBuilder().addComponents(entryAmount);

        // Add inputs to the modal
        const modal = new ModalBuilder()
            .setCustomId("giveawayEnterModal")
            .setTitle("Giveaway Entry");
        modal.addComponents(actionRow);

        await interaction.showModal(modal).catch((error) => {
            console.error(
                `[ERROR] [enterGiveaway] Failed to send modal to: ${userTag}`,
                error
            );
            return;
        });

        // Collect a modal submit interaction
        await interaction
            .awaitModalSubmit({
                filter: (i) => i.customId === "giveawayEnterModal",
                time: 60_000,
            })
            .then(async (i) => {
                await i.deferReply({ ephemeral: true });

                amount = i.fields.getTextInputValue("entryAmount");
                if (isNaN(amount)) {
                    await i.editReply({
                        content: "Please enter a number.",
                        ephemeral: true,
                    });
                    return;
                }
                amount = parseInt(amount);

                if (amount === 0) {
                    await i.editReply({
                        content: "❌ Please enter a number greater than **0**.",
                        ephemeral: true,
                    });
                    return;
                }

                if (amount > maxIn) {
                    await i.editReply({
                        content: `❌ You can have up to **${maxEntries}** entries but currently have **${currentEntries}**. Please insert an amount that is less than or equal to **${maxIn}**.`,
                        ephemeral: true,
                    });
                    return;
                }

                if (amount > balance) {
                    await i.editReply({
                        content: `❌ You don't have **${amount} ${token} Tokens**.`,
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
                    .setEmoji(token)
                    .setLabel(`${amount}`)
                    .setStyle(ButtonStyle.Success);
                const row = new ActionRowBuilder().addComponents(cancel, confirm);

                const embed = new EmbedBuilder()
                    .setTitle("Giveaway")
                    .setDescription(
                        `Would you like to exchange **${amount} ${token} Tokens** to have a total of **${
                            amount + currentEntries
                        }** entries?`
                    );
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
                            case "cancelEnterGiveaway": {
                                embed.setColor(red);
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
                                    embed.setColor(red);
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

                                embed.setColor(green);
                                await i.update({
                                    embeds: [embed],
                                    components: [],
                                });

                                const successEmbed = new EmbedBuilder()
                                    .setTitle("Giveaway")
                                    .setDescription(
                                        `:white_check_mark: Success! Your **${
                                            amount + currentEntries
                                        } entries** for this [giveaway](${messageLink}) are confirmed!`
                                    )
                                    .setColor(green);

                                await interaction.followUp({
                                    embeds: [successEmbed],
                                    ephemeral: true,
                                });
                                console.log(
                                    `[INFO] [enterGiveaway] Successfully entered giveaway (${amount}):`,
                                    userTag
                                );
                                return;
                            }
                        }
                    });
                } catch (error) {
                    console.error("[ERROR] [enterGiveaway]", error);
                    return;
                }
            })
            .catch(console.error);
    } else {
        try {
            await interaction.deferReply({ ephemeral: true });

            // Sponsor cannot enter their own giveaway
            if (userID === giveaway.sponsor) {
                await interaction.editReply({
                    content: "❌ You cannot enter your own giveaway.",
                    ephemeral: true,
                });
                console.log(
                    `[INFO] [enterGiveaway] Sponsor cannot enter their own giveaway:`,
                    userTag
                );
                return;
            }

            // No tokens
            if (balance === 0) {
                await interaction.editReply({
                    content: `❌ You need at least **1 ${token} Token** to enter this giveaway.`,
                    embeds: [getTokenHelpEmbed()],
                    ephemeral: true,
                });
                console.log(`[INFO] [enterGiveaway] 0 tokens in inventory:`, userTag);
                return;
            }

            // If already have max entries, display how to get more
            if (currentEntries === maxEntries) {
                let entries = `You have **${currentEntries} entries** in this giveaway.`;
                if (maxEntries === 1) {
                    entries = `You have **1 entry** in this giveaway.`;
                }

                let upgrade = `Become a <@&${config.roleID.activeBooster}> or <@&${config.roleID.serverSubscriber}> to have more entries!`;
                if (maxEntries === activeBoosterCap) {
                    upgrade = `Become a <@&${config.roleID.serverSubscriber}> to have more entries!`;
                } else if (maxEntries === serverSubscriberCap) {
                    upgrade = "You have the max amount of entries.";
                }

                const embed = new EmbedBuilder()
                    .setTitle("Giveaway")
                    .setDescription(entries + " " + upgrade)
                    .setColor(blue);

                await interaction.editReply({
                    embeds: [embed],
                    ephemeral: true,
                });
                console.log(`[INFO] [enterGiveaway] Already have max entries:`, userTag);
                return;
            }

            // If not entered yet, user has available balance, and only allowed 1 entry -> automatically enter
            if (currentEntries === 0 && maxEntries === 1) {
                amount = 1;
                try {
                    await client.inventoryQueue.enqueue(inventoryTask);
                    await client.giveawayQueue.enqueue(giveawayTask);
                } catch (error) {
                    console.error(error);
                    await interaction.editReply({
                        content: error.message,
                        ephemeral: true,
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle("Giveaway")
                    .setDescription(
                        `:white_check_mark: Success! Your **1 entry** for this [giveaway](${messageLink}) is confirmed!`
                    )
                    .setColor(green);

                await interaction.editReply({ embeds: [embed], ephemeral: true });
                console.log(
                    `[INFO] [enterGiveaway] Successfully entered giveaway (${amount}):`,
                    userTag
                );
                return;
            }
        } catch (error) {
            console.error("[ERROR] [enterGiveaway]", error);
            return;
        }
    }
}

module.exports = enterGiveaway;
