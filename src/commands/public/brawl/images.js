const { SlashCommandSubcommandBuilder } = require("discord.js");
const BrawlSetupModel = require("../../../brawl/schemas/brawlSetupSchema");
const { loadImage } = require("canvas");

module.exports = {
  category: "public/brawl",
  data: new SlashCommandSubcommandBuilder()
    .setName("images")
    .setDescription("Check for valid image URLs.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of the Card Brawl you are starting.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    // Owner permissions
    if (!interaction.member.roles.cache.some((role) => role.name === "Owner")) {
      return await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const name = interaction.options.getString("name");

    // Find brawl setup in database
    let setupModel;
    try {
      setupModel = await BrawlSetupModel.findOne({ name }).exec();
      if (!setupModel) {
        return await interaction.reply(`No Card Brawl found with the name **${name}**.`);
      }
    } catch (error) {
      return await interaction.reply(`Error retrieving Card Brawl.`);
    }

    await interaction.deferReply();

    const loadImagePromises = Array.from(setupModel.cards.entries()).map(
      async ([key, card]) => {
        try {
          // Attempt to load the image
          await loadImage(card.imageLink);
          return null; // Return null if image loaded successfully
        } catch (error) {
          return key; // Return the key if there was an error loading the image
        }
      }
    );

    // Wait for all loadImagePromises to resolve
    const badCardsKeys = await Promise.all(loadImagePromises);

    // Filter out the null values (successful image loads) and keep only the keys of failed loads
    const badCards = badCardsKeys.filter((key) => key !== null);

    if (badCards.length === 0) {
      return await interaction.editReply(`Successfully loaded all images!`);
    }
    return await interaction.editReply(`\`\`\`\n${badCards.join(`\n`)}\`\`\``);
  },
};
