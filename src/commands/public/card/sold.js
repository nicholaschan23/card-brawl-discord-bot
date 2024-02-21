const { SlashCommandSubcommandBuilder } = require("discord.js");
const CardAdsModel = require("../../../sell/schemas/cardAdSchema");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("sold")
        .setDescription("Delete a card listing.")
        .addStringOption((option) =>
            option.setName("code").setDescription("Card's unique code.").setRequired(true)
        ),
    category: "public/card",
    async execute(interaction) {
        const userID = interaction.user.id;
        const code = interaction.options.getString("code");
        const channel = client.channels.cache.get(config.channelID.cardAds);

        await interaction.deferReply({ ephemeral: true });

        const task = async () => {
            // Fetch existing card ad model
            const cardAdsModel = await CardAdsModel.findOne({
                code,
            }).exec();

            // Listing found
            if (cardAdsModel) {
                // Not the owner of the listing
                if (cardAdsModel.ownerID !== userID) {
                    return await interaction.editReply({
                        content: `❌ <@${userID}>, you do not own \`${code}\`.`,
                        allowedMentions: { parse: [] },
                    });
                }

                // Fetch card ad message to delete
                try {
                    const messageToDelete = await channel.messages.fetch(
                        cardAdsModel.messageID
                    );

                    await messageToDelete.delete();
                    console.log(
                        `[INFO] [sell] Deleted messageID:`,
                        cardAdsModel.messageID
                    );
                } catch (error) {}

                await cardAdsModel.deleteOne();
                return await interaction.editReply({
                    content: `✅ <@${userID}>, your post for \`${code}\` was successfully deleted.`,
                    allowedMentions: { parse: [] },
                });
            } else {
                return await interaction.editReply({
                    content: `❌ <@${userID}>, no post found for \`${code}\`.`,
                    allowedMentions: { parse: [] },
                });
            }
        };

        try {
            await client.cardAdsQueue.enqueue(task);
        } catch (error) {
            console.error("[ERROR] [sold]:", error);
            await interaction.editReply(`❌ An error occurred.`);
        }
    },
};
