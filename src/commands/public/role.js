const { SlashCommandBuilder } = require("discord.js");
const bot = require("./role/bot");
const color = require("./role/color");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role main command.")
        .addSubcommand(bot.data)
        .addSubcommand(color.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "bot": {
                await bot.execute(interaction);
                break;
            }
            case "color": {
                await color.execute(interaction);
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
