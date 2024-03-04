const { Events, Collection } = require("discord.js");
const enterGiveaway = require("../../giveaway/src/enterGiveaway");
const toggleRole = require("../../role/src/toggleRole");
const toggleBotRole = require("../../role/src/toggleBotRole");
const viewParticipants = require("../../giveaway/src/viewParticipants");
const viewUserStats = require("../../brawl/src/viewUserStats");
const handleOffer = require("../../sell/src/handleOffer");
const client = require("../../index");
const config = require("../../../config.json");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(
                    `[ERROR] [slashCommands] No command matching ${interaction.commandName} was found`
                );
                return;
            }

            // Global command cooldown
            const cooldowns = client.cooldowns;
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = config.globalCooldown;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime =
                    timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const secondsLeft = Math.ceil((expirationTime - now) / 1000);
                    if (secondsLeft === 1) {
                        return await interaction.reply({
                            content: `You can run that command again in \`1 second\`.`,
                            ephemeral: true,
                        });
                    }
                    return await interaction.reply({
                        content: `You can run that command again in \`${secondsLeft} seconds\`.`,
                        ephemeral: true,
                    });
                }
            }
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // Execute interaction
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(
                    `[ERROR] [slashCommands] Error executing command ${command.data.name}:`,
                    error
                );
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "Error while executing this command!",
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: "Error while executing this command!",
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(
                    `[ERROR] [slashCommands] No command matching ${interaction.commandName} was found`
                );
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(
                    `[ERROR] [slashCommands] Error autocompleting command ${command.data.name}:`,
                    error
                );
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === "enterGiveaway") {
                enterGiveaway(interaction);
            } else if (interaction.customId === "viewParticipants") {
                viewParticipants(interaction);
            } else if (interaction.customId === "viewUserStats") {
                viewUserStats(interaction);
            } else if (interaction.customId === "rejectOffer") {
                handleOffer(interaction, 0);
            } else if (interaction.customId === "acceptOffer") {
                handleOffer(interaction, 1);
            } else if (interaction.customId === "toggleBrawlCompetitor") {
                toggleRole(interaction, config.roleID.brawlCompetitor);
            } else if (interaction.customId === "toggleBrawlJudge") {
                toggleRole(interaction, config.roleID.brawlJudge);
            } else if (interaction.customId === "toggleKarutaDrop") {
                toggleBotRole(interaction, config.roleID.karutaDrop);
            } else if (interaction.customId === "toggleKarutaWishlist") {
                toggleBotRole(interaction, config.roleID.karutaWishlist);
            } else if (interaction.customId === "toggleKarutaEvent") {
                toggleBotRole(interaction, config.roleID.karutaEvent);
            } else if (interaction.customId === "toggleSofiWishlist") {
                toggleBotRole(interaction, config.roleID.sofiWishlist);
            } else if (interaction.customId === "toggleTofuDrop") {
                toggleBotRole(interaction, config.roleID.tofuDrop);
            } else if (interaction.customId === "toggleTofuWishlist") {
                toggleBotRole(interaction, config.roleID.tofuWishlist);
            } else if (interaction.customId === "toggleGachaponDrop") {
                toggleBotRole(interaction, config.roleID.gachaponDrop);
            } else if (interaction.customId === "toggleGachaponWishlist") {
                toggleBotRole(interaction, config.roleID.gachaponWishlist);
            }
        }
    },
};
