const { EmbedBuilder } = require("discord.js");

function getInventoryEmbed(inventoryModel) {
    const tokenItem = `:token: **${inventoryModel.numTokens}** · \`token\` · *Token*`;
    const embed = new EmbedBuilder()
        .setTitle(`Inventory`)
        .setDescription(`Items held by <@${userID}>\n\n${tokenItem}`);
    return embed;
}

module.exports = getInventoryEmbed;
