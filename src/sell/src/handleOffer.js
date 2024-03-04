const { EmbedBuilder } = require("discord.js");
const CardAdsModel = require("../schemas/cardAdSchema");
const client = require("../../index");
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

        const regex = /`([^`]+)`/;
        const match = regex.exec(embed.description);
        const code = match[1];
        const channel = client.channels.cache.get(config.channelID.cardAds);
        const task = async () => {
            // Fetch existing card ad model
            const cardAdsModel = await CardAdsModel.findOne({
                code,
            }).exec();

            // Listing found
            if (cardAdsModel) {
                // Fetch card ad message to delete
                try {
                    const messageToDelete = await channel.messages.fetch(
                        cardAdsModel.messageID
                    );

                    await messageToDelete.delete();
                    console.log(
                        `[INFO] [handleOffer] Deleted messageID:`,
                        cardAdsModel.messageID
                    );
                } catch (error) {
                    console.error("[ERROR] [handleOffer]:", error);
                }
                
                await cardAdsModel.deleteOne();
            }
        };

        try {
            await client.cardAdsQueue.enqueue(task);
        } catch (error) {
            console.error("[ERROR] [handleOffer]:", error);
        }
    }
}

module.exports = handleOffer;
