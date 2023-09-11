const { SlashCommandSubcommandBuilder } = require("discord.js");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("enter")
        .setDescription("Enter a card brawl.")
        .addStringOption((option) => 
            option
                .setName("name")
                .setDescription("Card brawl name you will be entering.")
                .setRequired(true)
            // TODO: Autocomplete brawl name
        ),
    async execute(interaction) {
        const name = interaction.options.getString("name");

        const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
        try {
            const foundBrawl = await BrawlSetupModel.findOne({ name }).exec();
            if (!foundBrawl) {
                interaction.reply(`No brawl setup found with name: ${name}`);
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            return;
        }
        interaction.reply("found it");
    },

    // Pull brawl name

    // // Read the image file into a Buffer (for example)
    // const imageBuffer = fs.readFileSync("path_to_your_image.jpg");

    // // Create a new document with the image data
    // const newImage = new ImageModel({
    //     name: "MyImage",
    //     data: imageBuffer,
    // });
};
