const { SlashCommandBuilder } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns bot latency."),
    category: "developer",
    async execute(interaction) {
        await interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};
