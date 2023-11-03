const { SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { client } = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/channel",
    data: new SlashCommandSubcommandBuilder()
        .setName("lock")
        .setDescription("Lock a channel.")
        .addStringOption((option) =>
            option
                .setName("channel")
                .setDescription("Channel you want to lock.")
                .addChoices({ name: "Drop Party", value: "1153101919179513980" })
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("User that is hosting the drop party.")
                .setRequired(true)
        ),
    async execute(interaction) {
        // Get input
        const channelID = interaction.options.getString("channel");
        const channel = client.channels.cache.get(channelID);
        const user = interaction.options.getUser("user");

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
