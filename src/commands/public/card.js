const { SlashCommandBuilder } = require("discord.js");
const sell = require("./card/sell");
const sold = require("./card/sold");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("card")
        .setDescription("Card main command.")
        .addSubcommand(sell.data)
        .addSubcommand(sold.data),
    cooldown: 60,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "sell": {
                await sell.execute(interaction);
                break;
            }
            case "sold": {
                await sold.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[ERROR] [card] There was no execute case for the '${subcommand}' subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
