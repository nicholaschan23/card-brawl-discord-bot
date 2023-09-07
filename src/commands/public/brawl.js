const { SlashCommandBuilder } = require("discord.js");
const create = require("./brawl/create");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("brawl")
        .addSubcommand(create.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch(subcommand) {
            case "create": {
                await create.execute(interaction);
            }
            default: {
                await interaction.reply(
                    "There was no case for the subcommand. Go fix the code."
                );
            }
        }
    }
};
