const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const imageFilter = require("./test/imageFilter");

module.exports = {
    category: "developer",
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("Test main command.")
        .addSubcommand(imageFilter.data)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "imageFilter": {
                await imageFilter.execute(interaction);
                break;
            }
            default: {
                await interaction.reply(
                    "There was no case for the subcommand. Go fix the code."
                );
            }
        }
    },
};
