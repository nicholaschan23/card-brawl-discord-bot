const { SlashCommandSubcommandBuilder } = require("discord.js");
const { config } = require("../../../../index");

const ranks = [
    "Copper V",
    "Copper IV",
    "Copper III",
    "Copper II",
    "Copper I",
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
];

module.exports = {
    category: "public/role",
    data: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a Karuta drop role to yourself.")
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
        const guild = config.guild;
        const member = await guild.members.fetch(interaction.user.id);
        const role = interaction.options.getString("role");

        // Eligible if user is ranked
        const eligible = ranks.some((roleName) => {
            const role = member.roles.cache.find((r) => r.name === roleName);
            return !!role;
        });

        const temp = guild.roles.cache.find((r) => r.name === role);
        if (eligible) {
            member.roles.add(temp);
            await interaction.reply({
                content: `You have successfully added the <@&${temp.id}> role!`,
                allowedMentions: { parse: [] },
            });
        } else {
            await interaction.reply({
                content: `You must be **Level 5** (<@&789659437919895593>) or higher to add the <@&${temp.id}> role. Chat to increase your server activity rank. See the <#776705377226981387> channel to learn more.`,
                allowedMentions: { parse: [] },
            });
        }
    },
};
