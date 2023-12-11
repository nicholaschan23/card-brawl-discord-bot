const { EmbedBuilder } = require("discord.js");
const { config } = require("../../index");

function getInventoryEmbed(inventoryModel) {
    const tokenItem = `${config.emoji.token} **${inventoryModel.numTokens}** · \`token\` · *Token*`;
    const embed = new EmbedBuilder()
        .setTitle(`Inventory`)
        .setDescription(`Items held by <@${inventoryModel.userID}>\n\n${tokenItem}`);
    return embed;
}

module.exports = getInventoryEmbed;
