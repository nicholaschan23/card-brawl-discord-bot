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
const UserInventoryModel = require("../../../inventory/schemas/userInventorySchema");
const getPreviewEmbed = require("../../../color/embeds/colorPreview");
const client = require("../../../index");
const config = require("../../../../config.json")

const colors = [
    "Red",
    "Pink",
    "Purple",
    "Deep Purple",
    "Indigo",
    "Blue",
    "Light Blue",
    "Cyan",
    "Teal",
    "Green",
];
const neonColors = [
    "Neon Red",
    "Neon Pink",
    "Neon Purple",
    "Neon Deep Purple",
    "Neon Indigo",
    "Neon Blue",
    "Neon Light Blue",
    "Neon Cyan",
    "Neon Teal",
    "Neon Green",
];
const colorSelect = [
    {
        label: "Red",
        value: config.roleID.red,
    },
    {
        label: "Pink",
        value: config.roleID.pink,
    },
    {
        label: "Purple",
        value: config.roleID.purple,
    },
    {
        label: "Deep Purple",
        value: config.roleID.deepPurple,
    },
    {
        label: "Indigo",
        value: config.roleID.indigo,
    },
    {
        label: "Blue",
        value: config.roleID.blue,
    },
    {
        label: "Light Blue",
        value: config.roleID.lightBlue,
    },
    {
        label: "Cyan",
        value: config.roleID.cyan,
    },
    {
        label: "Teal",
        value: config.roleID.teal,
    },
    {
        label: "Green",
        value: config.roleID.green,
    },
];
const neonColorSelect = [
    {
        label: "Neon Red",
        value: config.roleID.neonRed,
    },
    {
        label: "Neon Pink",
        value: config.roleID.neonPink,
    },
    {
        label: "Neon Purple",
        value: config.roleID.neonPurple,
    },
    {
        label: "Neon Deep Purple",
        value: config.roleID.neonDeepPurple,
    },
    {
        label: "Neon Indigo",
        value: config.roleID.neonIndigo,
    },
    {
        label: "Neon Blue",
        value: config.roleID.neonBlue,
    },
    {
        label: "Neon Light Blue",
        value: config.roleID.neonLightBlue,
    },
    {
        label: "Neon Cyan",
        value: config.roleID.neonCyan,
    },
    {
        label: "Neon Teal",
        value: config.roleID.neonTeal,
    },
    {
        label: "Neon Green",
        value: config.roleID.neonGreen,
    },
];

const blacklistRoles = [
    "Community Manager",
    "Moderator",
    "Server Subscriber",
    "Twitch Subscriber",
];

const findCurrentColorRole = (member, roles) => {
    for (const roleName of roles) {
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
        const guild = client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(userID);

        const allColorSelect = [...colorSelect, ...neonColorSelect];
        const select = new StringSelectMenuBuilder()
            .setCustomId("colorSelect")
            .setPlaceholder("Select a color")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                allColorSelect.map((color) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(color.label)
                        .setValue(color.value)
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
                const blacklist = findCurrentColorRole(member, blacklistRoles);
                if (blacklist) {
                    previewEmbed.setColor(config.embed.red);
                    await response1.edit({
                        embeds: [previewEmbed],
                        components: [],
                    });

                    i.reply({
                        content: `You already have an exclusive color from the ${blacklist} role!`,
                        ephemeral: true,
                        allowedMentions: { parse: [] },
                    });
                    return;
                }

                const roles = [...colors, ...neonColors];
                const currentRole = findCurrentColorRole(member, roles);
                addRole = guild.roles.cache.get(i.values[0]);

                // Already have selected color
                if (currentRole === addRole) {
                    previewEmbed.setColor(config.embed.red);
                    await response1.edit({
                        embeds: [previewEmbed],
                        components: [],
                    });

                    i.reply({
                        content: `You already have the color ${currentRole}!`,
                        ephemeral: true,
                        allowedMentions: { parse: [] },
                    });
                    return;
                }

                // Mark previous embed as done and successful
                previewEmbed.setColor(config.embed.green);
                await i.update({
                    embeds: [previewEmbed],
                    components: [],
                });

                // Determine price
                const cost = colors.includes(addRole.name) ? config.color.cost : config.color.neonCost;

                // Purchase confirmation embed
                let description =
                    currentRole !== null
                        ? `You'll lose the color ${currentRole} and have to repay if you want to swap back.\n`
                        : "";
                description += `Would you like to exchange **${cost} ${config.emoji.token} Tokens** for the color ${addRole}?`;
                const purchaseEmbed = new EmbedBuilder().setDescription(description);

                // Buttons
                const cancel = new ButtonBuilder()
                    .setCustomId("cancelColor")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary);
                const confirm = new ButtonBuilder()
                    .setCustomId("confirmColor")
                    .setEmoji(config.emoji.token)
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
                            purchaseEmbed.setColor(config.embed.red);
                            await confirmation.update({
                                embeds: [purchaseEmbed],
                                components: [],
                            });
                            return;
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
                                        `You don't have enough **${config.emoji.token} Tokens**.`
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
                                purchaseEmbed.setColor(config.embed.red);
                                await confirmation.update({
                                    embeds: [purchaseEmbed],
                                    components: [],
                                });

                                await interaction.followUp({
                                    content: error.message,
                                    ephemeral: true,
                                });
                                return;
                            }

                            purchaseEmbed.setColor(config.embed.green);
                            await confirmation.update({
                                embeds: [purchaseEmbed],
                                components: [],
                            });

                            await interaction.channel.send({
                                content: `<@${userID}> exchanged **${cost} ${config.emoji.token} Tokens** for the color ${addRole}!`,
                                allowedMentions: { parse: [] },
                            });
                            return;
                        }
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.followUp({
                        content:
                            "Confirmation not received within `1 minute`, cancelling.",
                        ephemeral: true,
                    });
                    return;
                }
            });
        } catch (error) {
            console.error(error);
            await interaction.followUp({
                content: "Confirmation not received within `1 minute`, cancelling.",
                ephemeral: true,
            });
            return;
        }
    },
};
