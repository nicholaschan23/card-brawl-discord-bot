const { TextInputBuilder, TextInputComponent } = require("discord.js");
const client = require("../../index");
const GiveawayModel = require("../schemas/giveawaySchema");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");

async function enterGiveaway(interaction) {
    const messageID = interaction.message.id;
    const userID = interaction.user.id;

    const textInput = new TextInputBuilder()
        .setCustomId("giveawayText")
        .setPlaceholder("Amount of tokens...")
        .setMinLength(1)
        .setMaxLength(1);

    const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
    const inventory = await UserInventoryModel.findOne({ userID }).exec();
    const numTokens = inventory.numTokens;

    await interaction.reply({ content: "", ephemeral: true });
}

module.exports = enterGiveaway;
