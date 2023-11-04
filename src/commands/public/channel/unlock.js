const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

module.exports = {
    category: "public/channel",
    data: new SlashCommandSubcommandBuilder()
        .setName("unlock")
        .setDescription("Unlock this channel.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "User that just hosted the drop party."
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.channel;
        const user = interaction.options.getUser("user");

        // Edits overwrites to disallow everyone to send messages
        channel.permissionOverwrites.edit(config.guildID, { SendMessages: true });
        channel.permissionOverwrites.delete(user.id);

        return await interaction.reply({
            content: `Unlocked ${channel}. Channel permissions reset for <@${user.id}>.`,
            allowedMentions: { parse: [] },
        });
    },
};
