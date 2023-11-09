const { SlashCommandBuilder } = require("discord.js");
const BrawlBracketModel = require("../../brawl/schemas/brawlBracketSchema");
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
    async autocomplete(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Populate choices
        let choices;
        switch (subcommand) {
            case "winner": {
                const brackets = await BrawlBracketModel.find();
                choices = [...brackets.map((schedule) => schedule.name)];
                break;
            }
            default: {
                console.error(
                    `[BRAWL] There was no autocomplete case for the "${subcommand}" subcommand`
                );
            }
        }

        // Manage autocomplete
        const focusedValue = interaction.options.getFocused();
        const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
        await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
    },
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
                console.error(
                    `[BRAWL] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
