const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { client } = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads a command.")
        .addStringOption((option) =>
            option
                .setName("command")
                .setDescription("What command do you want to reload?")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = [...client.commands.keys()];
        const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    async execute(interaction) {
        const commandName = interaction.options.getString("command", true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }

        delete require.cache[
            require.resolve(`../${command.category}/${command.data.name}.js`)
        ];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
        } catch (error) {
            await interaction.reply(
                `Error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
            );
            console.error("[ERROR] [reload] Error reloading a command");
        }
    },
};
