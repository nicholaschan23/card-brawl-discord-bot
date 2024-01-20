const client = require("../../index");
const config = require("../../../config.json");

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

/**
 * @param {interaction} Button
 */
function toggleBotRole(interaction, roleID) {
    try {
        const guild = client.guilds.cache.get(config.guildID);
        const role = guild.roles.cache.find((r) => r.id === roleID);
        const hasRole = interaction.member.roles.cache.some((r) => r.id === roleID);
        if (hasRole) {
            interaction.member.roles.remove(role);
            interaction.reply({
                content: `You have removed the ${role} role.`,
                allowedMentions: { parse: [] },
                ephemeral: true,
            });
        } else {
            // const eligible = interaction.member.roles.cache.some(
            //     (r) => r.id === config.roleID.activePlayer
            // );
            const eligible = interaction.member.roles.cache.some((role) => ranks.includes(role.name));
            
            if (eligible) {
                interaction.member.roles.add(role);
                interaction.reply({
                    content: `You have successfully added the ${role} role!`,
                    allowedMentions: { parse: [] },
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: `You must be **Level 5** (<@&789659437919895593>) or higher to add the ${role} role. Visit <#${config.channelID.features}> to learn more.`,
                    allowedMentions: { parse: [] },
                    ephemeral: true,
                });
            }
        }
        console.log(
            `[INFO] [toggleBotRole] Successfully toggled role '${role.name}':`,
            interaction.user.tag
        );
    } catch (error) {
        console.error("[ERROR] [toggleBotRole]", error);
    }
}

module.exports = toggleBotRole;
