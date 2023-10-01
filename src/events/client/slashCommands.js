const { Events, Collection, PermissionsBitField } = require("discord.js");
const config = require("../../../config.json");
const client = require("../../index");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            // Keep slash commands in designated channels
            const guild = client.guilds.cache.get(config.guildID);
            const hasSendMessagePermission = interaction.channel
                .permissionsFor(guild.members.me)
                .has(PermissionsBitField.Flags.ViewChannel);
            if (!hasSendMessagePermission) {
                // Bot doesn't have 'SEND_MESSAGES' permission in this channel
                interaction.reply({
                    content:
                        "Please use <#1152356454771216415> for Card Brawl commands.",
                    ephemeral: true,
                });
                return;
            }

            const command = interaction.client.commands.get(
                interaction.commandName
            );
            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            // Global command cooldown
            const { cooldowns } = require("../../index");
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = config.globalCooldown;
            const cooldownAmount =
                (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime =
                    timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({
                        content: `You can run the \`${command.data.name}\` command again <t:${expiredTimestamp}:R>.`,
                        ephemeral: true,
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(
                () => timestamps.delete(interaction.user.id),
                cooldownAmount
            );

            // Execute interaction
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content:
                            "There was an error while executing this command!",
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content:
                            "There was an error while executing this command!",
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(
                interaction.commandName
            );
            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    },
};
