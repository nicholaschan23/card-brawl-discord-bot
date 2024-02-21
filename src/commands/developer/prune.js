const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const inactive = require("./prune/inactive");
const duplicateThreads = require("./prune/duplicateThreads");
const cardAds = require("./prune/cardAds")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("prune")
    .setDescription("Prune main command.")
    .addSubcommand(inactive.data)
    .addSubcommand(duplicateThreads.data)
    .addSubcommand(cardAds.data)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "developer",
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "inactive": {
                await inactive.execute(interaction);
                break;
            }
            case "duplicate-threads": {
                await duplicateThreads.execute(interaction);
                break;
            }
            case "card-ads": {
                await cardAds.execute(interaction);
                break;
            }
            default: {
                console.error(
                    "[ERROR] [prune] There was no execute case for the '${subcommand}' subcommand"
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
