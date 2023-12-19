const client = require("../../index");

/**
 * @param {interaction} Button
 */
function toggleRole(interaction, roleID) {
    try {
        const guild = client.guilds.cache.get();
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
            interaction.member.roles.add(role);
            interaction.reply({
                content: `You have successfully added the ${role} role!`,
                allowedMentions: { parse: [] },
            });
        }
        console.log(
            `[INFO] [toggleRole] Successfully toggled role ${role.name}:`,
            interaction.user.tag
        );
    } catch (error) {
        console.error("[ERROR] [toggleRole]", error);
    }
}

module.exports = toggleRole;
