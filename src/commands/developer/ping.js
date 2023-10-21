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

        const {
            unixTimestampToCron,
            getNextSaturday,
        } = require("../../functions/schedule/scheduleEvent");
        const times = getNextSaturday();
        await interaction.followUp(`${unixTimestampToCron(times.start)}`)
        await interaction.followUp(`${unixTimestampToCron(times.start - 60 * 60 * 1000)}`)
        await interaction.followUp(`${unixTimestampToCron(times.start - 24 * 60 * 60 * 1000)}`)
    },
};
