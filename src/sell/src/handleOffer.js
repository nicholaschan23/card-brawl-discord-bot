const { EmbedBuilder, MessageMentions } = require("discord.js");
const config = require("../../../config.json");

const REJECT = 0;
const ACCEPT = 1;

async function handleOffer(interaction, decision) {
    await interaction.deferUpdate();
    const [seller, buyer] = interaction.message.content
        .match(/<@(\d+)>/g)
        .map((match) => match.match(/\d+/)[0]);
    // console.log(seller);
    // console.log(buyer);

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
