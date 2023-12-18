const { SlashCommandSubcommandBuilder } = require("discord.js");
const client = require("../../../../index");
const config = require("../../../../../config.json");

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
    category: "public/role/bot",
    data: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a role to get notified of drop events.")
        .addStringOption((option) =>
            option
                .setName("role")
                .setDescription("Card bot role you want to add.")
                .addChoices(
                    { name: "Karuta Drop", value: "Karuta Drop" },
                    { name: "Karuta Wishlist", value: "Karuta Wishlist" },
                    { name: "Karuta Event", value: "Karuta Event" },
                    { name: "Sofi Wishlist", value: "Sofi Wishlist" },
                    { name: "Tofu Drop", value: "Tofu Drop" },
                    { name: "Tofu Wishlist", value: "Tofu Wishlist" },
                    { name: "Gachapon Drop", value: "Gachapon Drop" },
                    { name: "Gachapon Wishlist", value: "Gachapon Wishlist" }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const guild = client.guilds.cache.get(config.guildID);
        const member = await guild.members.fetch(interaction.user.id);
        const roleName = interaction.options.getString("role");
        const role = guild.roles.cache.find((r) => r.name === roleName);

        // Eligible if user is ranked
        const eligible = ranks.some((roleName) => {
            const role = member.roles.cache.find((r) => r.name === roleName);
            return !!role;
        });

        if (eligible) {
            member.roles.add(role);
            interaction.editReply({
                content: `You have successfully added the <@&${role.id}> role!`,
                allowedMentions: { parse: [] },
            });
        } else {
            interaction.editReply({
                content: `You must be **Level 5** (<@&789659437919895593>) or higher to add the <@&${role.id}> role. Chat to increase your server activity rank. See the <#776705377226981387> channel to learn more.`,
                allowedMentions: { parse: [] },
            });
        }
    },
};
