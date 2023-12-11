const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const lock = require("./channel/lock");
const unlock = require("./channel/unlock");

module.exports = {
    category: "moderator",
    data: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Channel main command.")
        .addSubcommand(lock.data)
        .addSubcommand(unlock.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "lock": {
                await lock.execute(interaction);
                break;
            }
            case "unlock": {
                await unlock.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[ERROR] [channel] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
