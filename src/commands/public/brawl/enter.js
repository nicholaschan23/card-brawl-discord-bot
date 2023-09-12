const {
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const BrawlSetupModel = require("../../../data/schemas/brawlSetupSchema");
const BrawlSetup = require("../../../classes/brawlSetup");
const config = require("../../../../config.json");

module.exports = {
    category: "public/brawl",
    data: new SlashCommandSubcommandBuilder()
        .setName("enter")
        .setDescription("Enter a card brawl.")
        .addStringOption(
            (option) =>
                option
                    .setName("name")
                    .setDescription("Card brawl name you will be entering.")
                    .setRequired(true)
            // TODO: Autocomplete brawl name
        ),
    async execute(interaction) {
        const name = interaction.options.getString("name");

        // Find brawl setup in database
        let data;
        try {
            data = await BrawlSetupModel.findOne({ name }).exec();
            if (!data) {
                interaction.reply(`No brawl found with the name "${name}".`);
                return;
            }
        } catch (error) {
            console.log("Error retrieving brawl setups:", error);
            interaction.reply(`There was an error retrieving the brawl.`);
            return;
        }

        // Confirm correct brawl data
        const enterEmbed = new EmbedBuilder()
            .setColor(config.blue)
            .setTitle("Enter Card Brawl")
            .addFields(
                { name: "Name:", value: `\`\`\`${data.name}\`\`\`` },
                { name: "Theme:", value: `\`\`\`${data.theme}\`\`\`` },
                {
                    name: "Requirements:",
                    value: `- 🖼️ Framed\n- 💧 Dyed`,
                    inline: true,
                },
                {
                    name: "Host:",
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                }
            );
        const confirm = new ButtonBuilder()
            .setCustomId("confirmEnter")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);
        const cancel = new ButtonBuilder()
            .setCustomId("cancelEnter")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        // Display card brawl details
        let response = await interaction.reply({
            content: "Is this the correct card brawl you want to enter?",
            embeds: [enterEmbed],
            components: [row],
        });

        // Update embed based on button press
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        let confirmation;
        try {
            confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 30000,
            });

            switch (confirmation.customId) {
                case "cancelEnter": {
                    enterEmbed.setColor(config.red);
                    await confirmation.update({
                        content:
                            "Is this the correct card brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                    return;
                }
                case "confirmEnter": {
                    enterEmbed.setColor(config.green);
                    await confirmation.update({
                        content:
                            "Is this the correct card brawl you want to enter?",
                        embeds: [enterEmbed],
                        components: [],
                    });
                    await interaction.followUp(
                        "Show the card you want to enter: `kci <card code>`"
                    );
                    break;
                }
            }
        } catch (error) {
            enterEmbed.setColor(config.red);
            await interaction.followUp(
                "Cancelling, confirmation not received within 30 seconds."
            );
            return;
        }

        // Read card details embed
        // const botResponseFilter = (response) =>
        //     response.author.id === config.karutaID &&
        //     response.message.author.id === interaction.user.id &&
        //     response.channel.id == interaction.message.channel.id;
        // let botResponseEmbed;
        // try {
        //     const collected = await interaction.channel.awaitMessages({
        //         max: 1,
        //         time: 30000,
        //         errors: ["time"],
        //         filter: botResponseFilter,
        //     });

        //     if (collected.first()) {
        //         botResponseEmbed = collected.first().embed[0];
        //         if (botResponseEmbed) {
        //             if (botResponseEmbed.title !== "Card Details") {
        //                 await interaction.followUp("Wrong command.");
        //             }
        //         } else {
        //             await interaction.followUp(
        //                 "Response found. No embed found."
        //             );
        //         }
        //     } else {
        //         await interaction.followUp("No response found.");
        //     }
        // } catch (error) {
        //     console.log("Error while waiting for response:", error);
        //     await interaction.followUp("Error while waiting for response.");
        // }

        // const description = botResponseEmbed.description;
        // const cardImage = botResponseEmbed.thumbnail;
        // const cardCode = interaction.message;

        // if (!description.includes(`Owned by <@${interaction.user.id}>`)) {
        //     await interaction.followUp("You do not own this card.");
        // } else if (!description.includes(`Framed with`)) {
        //     await interaction.followUp("This card is not framed.");
        // } else if (!description.includes(`Framed with`)) {
        //     await interaction.followUp("This card is not dyed.");
        // }

        // setImage()

        // brawlSetupInstance.enter();

        // const brawlSetupInstance = new BrawlSetup(
        //     data.name,
        //     data.theme,
        //     data.size,
        //     data.entries,
        //     data.cards
        // );
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
