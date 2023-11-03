const { SlashCommandSubcommandBuilder, PermissionsBitField } = require("discord.js");
const { client } = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "public/channel",
    data: new SlashCommandSubcommandBuilder()
        .setName("unlock")
        .setDescription("Unlock a channel.")
        .addStringOption((option) =>
            option
                .setName("channel")
                .setDescription("Channel you want to unlock.")
                .addChoices({ name: "Drop Party", value: "1153101919179513980" })
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "User that previously hosted the drop party."
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        // Get input
        const channelID = interaction.options.getString("channel");
        const channel = client.channels.cache.get(channelID);
        const user = interaction.options.getUser("user");

        // Edits overwrites to disallow everyone to send messages
        channel.permissionOverwrites.edit(config.guildID, { SendMessages: true });
        channel.permissionOverwrites.delete(user.id);

        return await interaction.reply({
            content: `Unlocked ${channel}. Channel permissions updated for <@${user.id}>.`,
            allowedMentions: { parse: [] },
        });
    },
};
