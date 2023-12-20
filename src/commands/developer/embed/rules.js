const { SlashCommandSubcommandBuilder } = require("discord.js");
const getRulesEmbed = require("../../../support/embeds/rules");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("rules")
        .setDescription("Post rules embed."),
    category: "developer/embed",
    async execute(interaction) {
        interaction.channel.send({ embeds: [getRulesEmbed()] });
    },
};
