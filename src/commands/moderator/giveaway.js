const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const create = require("./giveaway/create");
const end = require("./giveaway/end");
const reroll = require("./giveaway/reroll");

module.exports = {
    category: "moderator",
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Giveaway main command.")
        .addSubcommand(create.data)
        .addSubcommand(reroll.data)
        .addSubcommand(end.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        // Moderator permissions
        if (!interaction.member.roles.cache.some((role) => role.name === "Moderator")) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "create": {
                await create.execute(interaction);
                break;
            }
            case "reroll": {
                await reroll.execute(interaction);
                break;
            }
            case "end": {
                await end.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[ERROR] [giveaway] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
