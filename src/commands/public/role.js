const { SlashCommandBuilder } = require("discord.js");
const add = require("./role/drop/add");
const remove = require("./role/drop/remove");
const color = require("./role/color");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Role main command.")
        .addSubcommandGroup((group) =>
            group
                .setName("drop")
                .setDescription("Manage Karuta drop pings")
                .addSubcommand(add.data)
                .addSubcommand(remove.data)
        )
        .addSubcommand(color.data),
    async execute(interaction) {
        // const subcommandGroup = interaction.options.getSubcommandGroup();
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
