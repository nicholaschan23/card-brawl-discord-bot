const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

module.exports = {
    category: "public/channel",
    data: new SlashCommandSubcommandBuilder()
        .setName("lock")
        .setDescription("Lock this channel.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User that is hosting the drop party.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const channel = interaction.channel;

        // Edits overwrites to disallow everyone to send messages
        channel.permissionOverwrites.edit(config.guildID, { SendMessages: false });

        // Edits overwrites to allow a user to send messages
        channel.permissionOverwrites.edit(user.id, { SendMessages: true });

        return await interaction.reply({
            content: `Locked ${channel}. <@${user.id}> is allowed to send messages.`,
            allowedMentions: { parse: [] },
        });
    },
};
