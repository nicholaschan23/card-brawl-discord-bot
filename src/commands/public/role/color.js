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

const colors = [
    "Orange",
    "Deep Orange",
    "Red",
    "Pink",
    "Purple",
    "Deep Purple",
    "Blue",
    "Light Blue",
    "Cyan",
    "Teal",
    "Green",
];
const neonColors = [
    "Neon Orange",
    "Neon Deep Orange",
    "Neon Red",
    "Neon Pink",
    "Neon Purple",
    "Neon Deep Purple",
    "Neon Blue",
    "Neon Light Blue",
    "Neon Cyan",
    "Neon Teal",
    "Neon Green",
];
const colorSelect = [
    {
        label: "Orange",
        value: color.orange,
    },
    {
        label: "Deep Orange",
        value: color.deepOrange,
    },
    {
        label: "Red",
        value: color.red,
    },
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
const neonColorSelect = [
    {
        label: "Neon Orange",
        value: color.neonOrange,
    },
    {
        label: "Neon Deep Orange",
        value: color.neonDeepOrange,
    },
    {
        label: "Neon Red",
        value: color.neonRed,
    },
    {
        label: "Neon Pink",
        value: color.neonPink,
    },
    {
        label: "Neon Purple",
        value: color.neonPurple,
    },
    {
        label: "Neon Deep Purple",
        value: color.neonDeepPurple,
    },
    {
        label: "Neon Indigo",
        value: color.neonIndigo,
    },
    {
        label: "Neon Blue",
        value: color.neonBlue,
    },
    {
        label: "Neon Light Blue",
        value: color.neonLightBlue,
    },
    {
        label: "Neon Cyan",
        value: color.neonCyan,
    },
    {
        label: "Neon Teal",
        value: color.neonTeal,
    },
    {
        label: "Neon Green",
        value: color.neonGreen,
    },
];

const findCurrentColorRole = (member) => {
    const allColors = [...colors, ...neonColors];
    for (const color of allColors) {
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

        const allColorSelect = [...colorSelect, ...neonColorSelect];
        const select = new StringSelectMenuBuilder()
            .setCustomId("colorSelect")
            .setPlaceholder("Select a color")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                allColorSelect.map((color) =>
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
                await i.update({
                    embeds: [previewEmbed],
                    components: [],
                });

                // Determine price
                const cost = colors.includes(addRole.name) ? color.cost : color.neonCost;

                // Purchase confirmation embed
                let description =
                    currentRole !== null ? `You already have the color ${currentRole}.\n` : "";
                description += `Would you like to exchange **${cost} ${config.emojiToken} Tokens** for the color ${addRole}?`;
                const purchaseEmbed = new EmbedBuilder().setDescription(description);

                // Buttons
                const cancel = new ButtonBuilder()
                    .setCustomId("cancelColor")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary);
                const confirm = new ButtonBuilder()
                    .setCustomId("confirmColor")
                    .setEmoji(config.emojiToken)
                    .setLabel(`${cost}`)
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
                                if (balance < cost) {
                                    throw new Error(
                                        `You don't have enough **${config.emojiToken} Tokens**.`
                                    );
                                }

                                if (currentRole) {
                                    await member.roles.remove(currentRole);
                                }
                                await member.roles.add(addRole);

                                // Update balance
                                inventoryModel.numTokens -= cost;
                                await inventoryModel.save();
                            };

                            // Place task in concurrency queue
                            try {
                                await client.inventoryQueue.enqueue(task);
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
