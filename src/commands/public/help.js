const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType,
    EmbedBuilder,
} = require("discord.js");
const getBrawlHelpEmbed = require("../../help/embeds/brawlHelp");
const getTokenHelpEmbed = require("../../help/embeds/tokenHelp");
const config = require("../../../config.json");

const helpSelect = [
    {
        label: "Brawl",
        value: "brawl",
        emoji: "🥊",
    },
    {
        label: "Token",
        value: "token",
        emoji: config.emoji.token,
    },
];

module.exports = {
    category: "public",
    data: new SlashCommandBuilder().setName("help").setDescription("Help main command."),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(
                "Select the topic you'd like help with using the dropdown menu below."
            );

        const select = new StringSelectMenuBuilder()
            .setCustomId("helpSelect")
            .setPlaceholder("Select a topic")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                helpSelect.map((help) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(help.label)
                        .setValue(help.value)
                        .setEmoji(help.emoji)
                )
            );
        const row1 = new ActionRowBuilder().addComponents(select);

        const response1 = await interaction.reply({
            embeds: [embed],
            components: [row1],
            ephemeral: true,
        });

        // Wait for topic selection
        try {
            const collector = await response1.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.user.id === interaction.user.id,
                time: 60_000,
            });

            collector.on("collect", async (i) => {
                let embed;
                switch (i.values[0]) {
                    case "brawl": {
                        embed = getBrawlHelpEmbed();
                        break;
                    }
                    case "token": {
                        embed = getTokenHelpEmbed();
                        break;
                    }
                }
                await i.update({
                    embeds: [embed],
                });
                collector.resetTimer();
            });
        } catch (error) {
            console.log("[WARN] [help] Timed out", error.message);
        }
    },
};
