const { SlashCommandBuilder } = require("discord.js");
const token = require("./help/token");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help main command.")
        .addSubcommand(token.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "token": {
                await token.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[HELP] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
