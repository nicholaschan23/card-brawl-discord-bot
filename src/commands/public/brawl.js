const { SlashCommandBuilder } = require("discord.js");
const create = require("./brawl/create");
const enter = require("./brawl/enter");
const start = require("./brawl/start");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("brawl")
        .setDescription("Brawl main command.")
        .addSubcommand(create.data)
        .addSubcommand(enter.data)
        .addSubcommand(start.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "create": {
                await create.execute(interaction);
                break;
            }
            case "enter": {
                await enter.execute(interaction);
                break;
            }
            case "start": {
                await start.execute(interaction);
                break;
            }
            default: {
                await interaction.reply(
                    "There was no case for the subcommand. Go fix the code."
                );
            }
        }
    }
};
