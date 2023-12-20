const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json")

function getRulesEmbeds() {
    const embed = new EmbedBuilder()
        .setTitle(`Introduction`)
        .setDescription(
            `Welcome to the **Far Shore**, a Noragami-themed anime & gaming community whose members enjoy various card collecting from: <@${config.botID.karuta}>, <@${config.botID.sofi}>, <@${config.botID.tofu}>, and <@${config.botID.gachapon}>. We have a custom bot with exclusive features to enhance the gameplay and use of these collectibles you can see below.`
        );
    return embed;
}

module.exports = getRulesEmbeds;
