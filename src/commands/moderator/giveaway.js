const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const create = require("./giveaway/create");
const reroll = require("./giveaway/reroll");

module.exports = {
    category: "moderator",
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Giveaway main command.")
        .addSubcommand(create.data)
        .addSubcommand(reroll.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
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
            default: {
                console.error(
                    `[GIVEAWAY] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
