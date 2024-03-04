const { EmbedBuilder, MessageMentions } = require("discord.js");
const config = require("../../../config.json");

const DECLINE = 0;
const ACCEPT = 1;

async function handleOffer(interaction, decision) {
    await interaction.deferUpdate();
    const [sellerID, buyerID] = interaction.message.content
        .match(/<@(\d+)>/g)
        .map((match) => match.match(/\d+/)[0]);

    if (interaction.user.id === sellerID) {
        const embed = new EmbedBuilder(interaction.message.embeds[0]);
        let content = "";

        if (decision === DECLINE) {
            embed.setColor(config.embed.red);
            content = `❌ <@${buyerID}>, your offer was declined by <@${sellerID}>.`;
        } else if (decision === ACCEPT) {
            embed.setColor(config.embed.green);
            content = `✅ <@${buyerID}>, your offer was accepted by <@${sellerID}>!`;
        }

        await interaction.message.delete();
        await interaction.channel.send({ content: content, embeds: [embed] });
    }
}

module.exports = handleOffer;
