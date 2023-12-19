const { SlashCommandSubcommandBuilder } = require("discord.js");
const toggleBotRole = require("../../../role/src/toggleBotRole")
const config = require("../../../../config.json")

module.exports = {
    category: "public/role/bot",
    data: new SlashCommandSubcommandBuilder()
        .setName("bot")
        .setDescription("Add/remove a card bot role.")
        .addStringOption((option) =>
            option
                .setName("role")
                .setDescription("Card bot role you want to add/remove.")
                .addChoices(
                    { name: "Karuta Drop", value: config.roleID.karutaDrop },
                    { name: "Karuta Wishlist", value: config.roleID.karutaWishlist },
                    { name: "Karuta Event", value: config.roleID.karutaEvent },
                    { name: "Sofi Wishlist", value: config.roleID.sofiWishlist },
                    { name: "Tofu Drop", value: config.roleID.tofuDrop },
                    { name: "Tofu Wishlist", value: config.roleID.tofuWishlist },
                    { name: "Gachapon Drop", value: config.roleID.gachaponDrop },
                    { name: "Gachapon Wishlist", value: config.roleID.gachaponWishlist }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const roleID = interaction.options.getString("role");
        toggleBotRole(interaction, roleID);
    },
};
