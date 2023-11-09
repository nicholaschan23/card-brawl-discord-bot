const {
    SlashCommandSubcommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
} = require("discord.js");
const getPreviewEmbed = require("../../../color/embeds/colorPreview");
const client = require("../../../index");
const config = require("../../../../config.json");
const color = require("../../../color/color-config.json");
const UserInventoryModel = require("../../../inventory/schemas/userInventorySchema");

const colors = ["Pink", "Purple", "Deep Purple", "Blue", "Light Blue", "Cyan", "Teal", "Green"];
const colorSelect = [
    {
        label: "Pink",
        value: color.pink,
    },
    {
        label: "Purple",
        value: color.purple,
    },
    {
        label: "Deep Purple",
        value: color.deepPurple,
    },
    {
        label: "Indigo",
        value: color.indigo,
    },
    {
        label: "Blue",
        value: color.blue,
    },
    {
        label: "Light Blue",
        value: color.lightBlue,
    },
    {
        label: "Cyan",
        value: color.cyan,
    },
    {
        label: "Teal",
        value: color.teal,
    },
    {
        label: "Green",
        value: color.green,
    },
];

const findCurrentColorRole = (member) => {
    for (const color of colors) {
        const roleName = color; // Role name matches color name
        const role = member.roles.cache.find((r) => r.name === roleName);

        if (role) {
            return role; // Return the first matching role found
        }
    }
    return null; // Return null if no matching role is found
};

module.exports = {
    category: "public/role",
    data: new SlashCommandSubcommandBuilder()
        .setName("color")
        .setDescription("Add a color role to yourself."),
    async execute(interaction) {
        const userID = await interaction.user.id;
        const guild = await client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(userID);

        const select = new StringSelectMenuBuilder()
            .setCustomId("colorSelect")
            .setPlaceholder("Select a color")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                colorSelect.map((color) =>
                    new StringSelectMenuOptionBuilder().setLabel(color.label).setValue(color.value)
                )
            );
        const row1 = new ActionRowBuilder().addComponents(select);

        const previewEmbed = getPreviewEmbed();
        const response1 = await interaction.reply({
            embeds: [previewEmbed],
            components: [row1],
            ephemeral: true,
        });

        // Wait for color role selection
        let role;
        const collectorFilter = (i) => i.user.id === userID;
        try {
            const collector = await response1.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: collectorFilter,
                max: 1,
                time: 60_000,
            });

            collector.on("collect", async (i) => {
                const currentRole = findCurrentColorRole(member);
                addRole = guild.roles.cache.get(i.values[0]);

                // Already have selected color
                if (currentRole === addRole) {
                    previewEmbed.setColor(config.red);
                    await response1.edit({
                        embeds: [previewEmbed],
                        components: [],
                    });

                    return i.reply({
                        content: `You already have the color ${currentRole}!`,
                        ephemeral: true,
                        allowedMentions: { parse: [] },
                    });
                }

                // Mark previous embed as done and successful
                previewEmbed.setColor(config.green);
                await response1.edit({
                    embeds: [previewEmbed],
                    components: [],
                });

                i.reply({
                    content: `You've selected ${addRole}!`,
                    ephemeral: true,
                    allowedMentions: { parse: [] },
                });

                // Purchase confirmation embed
                let description =
                    currentRole !== null ? `You already have the color ${currentRole}.\n` : "";
                description += `Would you like to exchange **${color.cost} ${config.emojiToken} Tokens** for the color ${addRole}?`;
                const purchaseEmbed = new EmbedBuilder().setDescription(description);

                // Buttons
                const cancel = new ButtonBuilder()
                    .setCustomId("cancelColor")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary);
                const confirm = new ButtonBuilder()
                    .setCustomId("confirmColor")
                    .setEmoji(config.emojiToken)
                    .setLabel(`${color.cost}`)
                    .setStyle(ButtonStyle.Success);
                const row2 = new ActionRowBuilder().addComponents(cancel, confirm);

                // Message
                const response2 = await interaction.followUp({
                    embeds: [purchaseEmbed],
                    components: [row2],
                    ephemeral: true,
                });

                // Wait for purchase confirmation
                try {
                    const confirmation = await response2.awaitMessageComponent({
                        max: 1,
                        time: 60_000,
                    });

                    switch (confirmation.customId) {
                        case "cancelColor": {
                            purchaseEmbed.setColor(config.red);
                            return await confirmation.update({
                                embeds: [purchaseEmbed],
                                components: [],
                            });
                        }
                        case "confirmColor": {
                            const task = async () => {
                                // Retrieve inventory
                                const inventoryModel = await UserInventoryModel.findOne({
                                    userID,
                                }).exec();

                                // Check if it exists
                                if (!inventoryModel) {
                                    throw new Error(`You have no inventory yet.`);
                                }

                                // Check balance
                                const balance = inventoryModel.numTokens;
                                if (balance < color.cost) {
                                    throw new Error(
                                        `You don't have enough ${config.emojiToken} Tokens**.`
                                    );
                                }

                                if (currentRole) {
                                    await member.roles.remove(currentRole);
                                }
                                await member.roles.add(addRole);

                                // Update balance
                                inventoryModel.numTokens -= color.cost;
                                await inventoryModel.save();
                            };

                            // Place task in concurrency queue
                            try {
                                client.inventoryQueue.enqueue(task);
                            } catch (error) {
                                purchaseEmbed.setColor(config.red);
                                await confirmation.update({
                                    embeds: [purchaseEmbed],
                                    components: [],
                                });

                                return await interaction.followUp({
                                    content: error.message,
                                    ephemeral: true,
                                });
                            }

                            purchaseEmbed.setColor(config.green);
                            await confirmation.update({
                                embeds: [purchaseEmbed],
                                components: [],
                            });

                            return await interaction.followUp({
                                content: `You are now the color ${addRole}!`,
                                ephemeral: true,
                                allowedMentions: { parse: [] },
                            });
                            break;
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return await interaction.followUp({
                        content: "Confirmation not received within `1 minute`, cancelling.",
                        ephemeral: true,
                    });
                }
            });
        } catch (error) {
            console.error(error);
            return await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
        }
    },
};
