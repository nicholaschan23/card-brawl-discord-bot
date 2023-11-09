const client = require("../../index");
const GiveawayModel = require("../schemas/giveawaySchema");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");

async function viewParticipants(interaction) {
    const messageID = interaction.message.id;
    const userID = interaction.user.id;

    const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
    const inventoryModel = await UserInventoryModel.findOne({ userID }).exec();

    await interaction.reply({ content: "", ephemeral: true });
}

module.exports = viewParticipants;
