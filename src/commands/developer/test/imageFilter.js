const { SlashCommandBuilder } = require("discord.js");
const { client } = require("../../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imageFilter")
        .setDescription("Apply image filter to remove card code and print.")
        .addStringOption((option) =>
            option
                .setName("link")
                .setDescription("Card image link.")
                .setRequired(true)
        ),
    category: "developer/test",
    async execute(interaction) {
        await interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};
