const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const featuresContent =
    `# Introduction\n` +
    `Welcome to the **Far Shore**, a Noragami-themed anime & gaming community whose members enjoy various card collecting games: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>. We have an exclusive custom bot with exclusive features to enhance the gameplay and use of these collectibles you can see below.`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("features")
        .setDescription("Post features."),
    category: "developer/post",
    async execute(interaction) {
        interaction.channel.send({
            content: featuresContent,
            allowedMentions: { parse: [] },
        });
        interaction.reply({ content: "Done!", ephemeral: true });
    },
};
