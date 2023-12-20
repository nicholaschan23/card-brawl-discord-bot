const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const rules = require("./post/rules");
const features = require("./post/features");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("post")
        .setDescription("Embed main command.")
        .addSubcommand(rules.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "rules": {
                await rules.execute(interaction);
                break;
            }
            case "features": {
                await features.execute(interaction);
                break;
            }
            default: {
                console.error(
                    "[ERROR] [role] There was no execute case for the '${subcommand}' subcommand"
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
