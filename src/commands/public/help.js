const { SlashCommandBuilder } = require("discord.js");
const brawl = require("./help/brawl");
const token = require("./help/token");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help main command.")
        .addSubcommand(brawl.data)
        .addSubcommand(token.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "brawl": {
                await brawl.execute(interaction);
                break;
            }
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
