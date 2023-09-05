const { SlashCommandBuilder } = require("discord.js");
const client = require("../../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns bot's latency"),
    async execute(interaction) {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};
