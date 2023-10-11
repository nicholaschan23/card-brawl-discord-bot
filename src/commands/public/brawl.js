const { SlashCommandBuilder } = require("discord.js");
const create = require("./brawl/create");
const enter = require("./brawl/enter");
const start = require("./brawl/start");
const instructions = require("./brawl/instructions");
const stats = require("./brawl/stats");
const winner = require("./brawl/winner");
const view = require("./brawl/view");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("brawl")
        .setDescription("Brawl main command.")
        .addSubcommand(create.data)
        .addSubcommand(enter.data)
        .addSubcommand(start.data)
        .addSubcommand(instructions.data)
        .addSubcommand(stats.data)
        .addSubcommand(winner.data)
        .addSubcommand(view.data),
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
            case "instructions": {
                await instructions.execute(interaction);
                break;
            }
            case "stats": {
                await stats.execute(interaction);
                break;
            }
            case "winner": {
                await winner.execute(interaction);
                break;
            }
            case "view": {
                await view.execute(interaction);
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
