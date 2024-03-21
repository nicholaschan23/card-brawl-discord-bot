const { SlashCommandBuilder } = require("discord.js");
const CardAdsModel = require("../../sell/schemas/cardAdSchema");
const sell = require("./card/sell");
const sold = require("./card/sold");
const offer = require("./card/offer");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("card")
        .setDescription("Card main command.")
        .addSubcommand(sell.data)
        .addSubcommand(sold.data)
        .addSubcommand(offer.data),
    cooldown: 20,
    async autocomplete(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Populate choices
        let choices;
        switch (subcommand) {
            case "offer": {
                const cardAds = await CardAdsModel.find();
                choices = [...cardAds.map((model) => model.code)];
                choices.reverse();
                break;
            }
            default: {
                console.error(
                    `[ERROR] [card] There was no autocomplete case for the "${subcommand}" subcommand`
                );
            }
        }

        // Manage autocomplete
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const filtered = choices.filter((choice) =>
            choice.toLowerCase().startsWith(focusedValue)
        );
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        );
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "sell": {
                await sell.execute(interaction);
                break;
            }
            case "sold": {
                await sold.execute(interaction);
                break;
            }
            case "offer": {
                await offer.execute(interaction);
                break;
            }
            default: {
                console.error(
                    `[ERROR] [card] There was no execute case for the '${subcommand}' subcommand`
                );
                await interaction.reply(
                    `There was no execute case for the \`${subcommand}\` subcommand.`
                );
            }
        }
    },
};
