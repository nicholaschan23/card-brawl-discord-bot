const { SlashCommandSubcommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("duplicate-threads")
        .setDescription("Prune duplicate threads.")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The forum channel to prune duplicate thread from.")
        ),
    category: "developer/prune",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const ownerSet = new Set();
        let numDeleted = 0;
        const channel = interaction.options.getChannel("channel");
        await channel.threads
            .fetchActive()
            .then((threadChannelObjects) => {
                for (const [threadId, thread] of threadChannelObjects.threads) {
                    if (ownerSet.has(thread.ownerId)) {
                        numDeleted++;
                        thread.delete("Duplicate thread");
                    } else {
                        ownerSet.add(thread.ownerId);
                    }
                }
            })
            .catch(console.error);

        await channel.threads
            .fetchArchived()
            .then((threadChannelObjects) => {
                for (const [threadId, thread] of threadChannelObjects.threads) {
                    if (ownerSet.has(thread.ownerId)) {
                        numDeleted++;
                        thread.delete("Duplicate thread");
                    } else {
                        ownerSet.add(thread.ownerId);
                    }
                }
            })
            .catch(console.error);

        await interaction.editReply({
            content: `Deleted ${numDeleted} duplicate threads. Kept ${ownerSet.size}.`,
        });
    },
};
