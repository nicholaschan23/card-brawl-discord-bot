const { SlashCommandSubcommandBuilder } = require("discord.js");
const client = require("../../../../index");
const config = require("../../../../../config.json");

module.exports = {
    category: "public/role/bot",
    data: new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove a drop role from yourself.")
        .addStringOption((option) =>
            option
                .setName("role")
                .setDescription("Card bot role you want to remove.")
                .addChoices(
                    { name: "Karuta Drop", value: "Karuta Drop" },
                    { name: "Karuta Wishlist", value: "Karuta Wishlist" },
                    { name: "Karuta Event", value: "Karuta Event" },
                    { name: "Gachapon Drop", value: "Gachapon Drop" },
                    { name: "Gachapon Wishlist", value: "Gachapon Wishlist" }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(interaction.user.id);
        const roleName = interaction.options.getString("role");
        const role = guild.roles.cache.find((r) => r.name === roleName);

        const hasRole = interaction.member.roles.cache.some(
            (role) => role.name === roleName
        );

        if (hasRole) {
            member.roles.remove(role);
            interaction.editReply({
                content: `You have successfully removed the <@&${role.id}> role!`,
                allowedMentions: { parse: [] },
            });
        } else {
            interaction.editReply({
                content: `You do not have the <@&${role.id}> role.`,
                allowedMentions: { parse: [] },
            });
        }
    },
};
