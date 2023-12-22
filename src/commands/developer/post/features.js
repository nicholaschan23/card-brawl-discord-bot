const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const introduction =
    `# Introduction\n` +
    `Welcome to the **Far Shore**, a Noragami-themed anime & gaming community whose members enjoy various card collecting games: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>. We have an exclusive custom bot with features to enhance the gameplay and use of these collectibles you can see below.\n\n` +
    `We hope you like our attention to detail, friendly culture, and organization throughout the server. Enjoy your stay!`;

const serverFeatures = `## Server Features`

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("features")
        .setDescription("Post features."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.channel.send({
            content: introduction,
            allowedMentions: { parse: [] },
        });
        interaction.reply({ content: "Done!", ephemeral: true });
    },
};
