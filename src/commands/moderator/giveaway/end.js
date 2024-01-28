const { SlashCommandSubcommandBuilder } = require("discord.js");
const endGiveaway = require("../../../giveaway/tasks/endGiveaway");

module.exports = {
    category: "moderator/giveaway",
    data: new SlashCommandSubcommandBuilder()
        .setName("end")
        .setDescription("End a giveaway when there's an error.")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("Message ID of the giveaway.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const messageID = interaction.options.getString("id");
        const data = { messageID: messageID }
        await endGiveaway(data);
        await interaction.reply("Successfully ended giveaway!");
    },
};
