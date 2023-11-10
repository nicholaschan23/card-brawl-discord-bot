const { SlashCommandSubcommandBuilder } = require("discord.js");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/role",
    data: new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove a drop role from yourself.")
        .addStringOption((option) =>
            option
                .setName("role")
                .setDescription("Role you want to remove.")
                .addChoices(
                    { name: "Server Drop", value: "Server Drop" },
                    { name: "Wishlist Drop", value: "Wishlist Drop" },
                    { name: "Event Drop", value: "Event Drop" }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const guild = client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(interaction.user.id);
        const role = interaction.options.getString("role");

        const hasRole = interaction.member.roles.cache.some((roleName) => roleName.name === role);

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
