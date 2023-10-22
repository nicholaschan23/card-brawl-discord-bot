const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { client } = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns bot latency.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    category: "developer",
    async execute(interaction) {
        await interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};
