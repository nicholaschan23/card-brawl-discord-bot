const { SlashCommandSubcommandBuilder } = require("discord.js");
const client = require("../../../../index");
const config = require("../../../../../config.json");

module.exports = {
    category: "public/role",
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
        const guild = client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(interaction.user.id);
        const role = interaction.options.getString("role");

        const hasRole = interaction.member.roles.cache.some(
            (roleName) => roleName.name === role
        );

        const temp = guild.roles.cache.find((r) => r.name === role);
        if (hasRole) {
            member.roles.remove(temp);
            await interaction.reply({
                content: `You have successfully removed the <@&${temp.id}> role!`,
                allowedMentions: { parse: [] },
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: `You do not have the <@&${temp.id}> role.`,
                allowedMentions: { parse: [] },
                ephemeral: true,
            });
        }
    },
};
