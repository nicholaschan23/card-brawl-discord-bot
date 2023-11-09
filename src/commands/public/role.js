const { SlashCommandBuilder } = require("discord.js");
const add = require("./role/add");
const remove = require("./role/remove");
const color = require("./role/color");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role main command.")
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(color.data),
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
            case "color": {
                await color.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[ROLE] There was no execute case for the "${subcommand}" subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
