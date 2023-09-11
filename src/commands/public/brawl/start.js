const { SlashCommandSubcommandBuilder } = require("discord.js");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("start")
        .setDescription("Start a card brawl.")
        .addStringOption(
            (option) =>
                option
                    .setName("name")
                    .setDescription("Name of the card brawl you are starting.")
                    .setRequired(false)
            // TODO: Autocomplete brawl name
        ),
    async execute(interaction) {
        // Check eligibility
        const current = 0;
        const goal = 1;
        if (current !== goal) {
            await interaction.reply(
                `This card brawl needs **${
                    goal - current
                }** more contestants! Only **${current}/${goal}** cards are entered.`
            );
        }

        // Get competitors and create brawl bracket
        // const competitors = [...this.cards.keys()];
    },
};
