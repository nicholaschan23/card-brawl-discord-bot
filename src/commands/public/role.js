const { SlashCommandBuilder } = require("discord.js");
const add = require("./role/add");
const remove = require("./role/remove");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role main command.")
        .addSubcommand(add.data)
        .addSubcommand(remove.data),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "add": {
                await add.execute(interaction);
                break;
            }
            case "remove": {
                await remove.execute(interaction);
                break;
            }
            default: {
                await interaction.reply("There was no case for the subcommand. Go fix the code.");
            }
        }
    },
};
