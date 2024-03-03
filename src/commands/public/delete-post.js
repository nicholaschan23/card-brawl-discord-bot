const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("delete-post")
        .setDescription("Delete your post."),
    async execute(interaction) {
        const threadChannel = interaction.channel;

        if (threadChannel.ownerId !== interaction.user.id) {
            return await interaction.reply({ content: "❌ You do not own this post." });
        }

        const confirm = new ButtonBuilder()
            .setCustomId("confirmDelete")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId("cancelDelete")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `Are you sure you want to delete this post?`,
            fetchReply: true,
            components: [row],
            ephemeral: true,
        });

        // Wait for confirmation
        try {
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                max: 1,
                time: 60_000,
            });

            collector.on("collect", async (i) => {
                switch (i.customId) {
                    case "cancelDelete": {
                        return await i.update({
                            content: `❌ Cancelled deleting post.`,
                            components: [],
                        });
                    }
                    case "confirmDelete": {
                        threadChannel.delete("Owner requested");
                    }
                }
            });
        } catch (error) {
            console.error("[ERROR] [delete-post]", error);
            return await interaction.editReply({
                content: `❌ Error deleting post: ${error}`,
                components: [],
            });
        }
    },
};
