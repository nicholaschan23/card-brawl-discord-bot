const { EmbedBuilder } = require("discord.js");
const config = require("../../../config.json");

const REJECT = 0;
const ACCEPT = 1;

async function handleOffer(interaction, decision) {
    await interaction.deferUpdate();

    const mentions = interaction.message.mentions.users.map((user) => user);
    const seller = mentions[0];
    const buyer = mentions[1];

    if (interaction.user.id === seller.id) {
        const embed = new EmbedBuilder(interaction.message.embeds[0]);
        let content = "";

        if (decision === REJECT) {
            embed.setColor(config.embed.red);
            content = `${buyer}, your offer was reject by ${seller}.`;
        } else if (decision === ACCEPT) {
            embed.setColor(config.embed.green);
            content = `${buyer}, your offer was accepted by ${seller}!`;
        }

        await interaction.message.delete();
        await interaction.channel.send({ content: content, embeds: [embed] });
    }
}

module.exports = handleOffer;
