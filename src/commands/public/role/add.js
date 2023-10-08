const { SlashCommandSubcommandBuilder } = require("discord.js");
const { client } = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/role",
    data: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a role to yourself.")
        .addStringOption((option) =>
            option
                .setName("role")
                .setDescription("Role you want to add.")
                .addChoices(
                    { name: "Server Drop", value: "Server Drop" },
                    { name: "Wishlist Drop", value: "Wishlist Drop" },
                    { name: "Event Drop", value: "Event Drop" }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const guild = client.guilds.cache.get(config.guildID);
        const member = guild.members.cache.get(interaction.user.id);
        const role = interaction.options.getString("role");
        const eligibleRoles = [
            "Bronze V",
            "Bronze IV",
            "Bronze III",
            "Bronze II",
            "Bronze I",
            "Silver V",
            "Silver IV",
            "Silver III",
            "Silver II",
            "Silver I",
            "Gold III",
            "Gold II",
            "Gold I",
            "Platinum III",
            "Platinum II",
            "Platinum I",
            "Diamond",
            "Champion",
            "Server Subscriber",
        ];

        const hasRole = eligibleRoles.some((roleName) => {
            const role = member.roles.cache.find((r) => r.name === roleName);
            return !!role;
        });

        const temp = guild.roles.cache.find((r) => r.name === role);
        if (hasRole) {
            member.roles.add(temp);
            await interaction.reply({
                content: `You have successfully added the <@&${temp.id}> role!`,
                allowedMentions: { parse: [] },
            });
        } else {
            await interaction.reply({
                content: `You must be <@&789659541586837525> or higher to add the <@&${temp.id}> role or bypass this requirement with the <@&${config.serverSubscriberRole}> role. Chat to increase your server activity rank. See the <#776705377226981387> channel to learn more.`,
                allowedMentions: { parse: [] },
            });
        }
    },
};
