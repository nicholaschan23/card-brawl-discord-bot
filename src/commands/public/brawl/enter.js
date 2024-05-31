const { SlashCommandSubcommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const BrawlSetupModel = require("../../../brawl/schemas/brawlSetupSchema");
const InventoryModel = require("../../../inventory/schemas/userInventorySchema");
const getEnterEmbed = require("../../../brawl/embeds/brawlEnter");
const getAnnouncementEmbed = require("../../../brawl/embeds/brawlAnnouncement");
const client = require("../../../index");
const config = require("../../../../config.json");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Function to download an image from a URL and save it locally
async function downloadImage(imageUrl, fileName) {
  try {
    const savePath = path.join(config.brawl.cards_directory, fileName);

    // Log the URL to ensure it is correct
    console.log("Downloading image from URL:", imageUrl);

    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    // Ensure the directory exists
    await fs.ensureDir(path.dirname(savePath));

    // Pipe the response data to a writable stream to save it as a file
    response.data
      .pipe(fs.createWriteStream(savePath))
      .on("finish", () => {
        console.log("Image downloaded and saved to", savePath);
      })
      .on("error", (error) => {
        console.error("Error saving the image:", error);
      });
  } catch (error) {
    console.error("Error downloading the image:", error.message);
  }
}

module.exports = {
  category: "public/brawl",
  data: new SlashCommandSubcommandBuilder().setName("enter").setDescription("Enter a card competition."),
  async execute(interaction) {
    const channel = client.channels.cache.get(interaction.channel.id);
    const userID = interaction.user.id;

    // Find the latest brawl setup in database
    let setupModel;
    try {
      setupModel = await BrawlSetupModel.findOne().sort({ _id: -1 });
    } catch (error) {
      console.error("[brawl/enter] Error retrieving BrawlSetupModel:", error);
      return await interaction.reply({
        content: `❌ Error retrieving Card Brawl from database.`,
      });
    }

    // Check preconditions
    if (!setupModel.open) {
      return await interaction.reply({
        content: `❌ There is currently no active Card Brawl.`,
      });
    }

    // Get cost to enter brawl
    let cost,
      numCardsEntered = 0;
    if (setupModel.entries.get(userID)) {
      numCardsEntered = setupModel.entries.get(userID).length;
      cost = numCardsEntered * config.brawl.cost;

      // Server subscriber gets discount for additional entries
      if (interaction.member.roles.cache.some((role) => role.name === "Server Subscriber")) {
        cost *= config.brawl.discount;
      }
    }

    // Confirm correct brawl data
    const cancel = new ButtonBuilder().setCustomId("cancelEnter").setLabel("Cancel").setStyle(ButtonStyle.Danger);
    const confirm = new ButtonBuilder().setCustomId("confirmEnter").setLabel("Confirm").setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(cancel, confirm);

    let enterReply, enterEmbed;
    if (cost > 0) {
      const cardsEntered = setupModel.entries
        .get(userID)
        .map((str) => `\`${str}\``)
        .join(", ");
      enterEmbed = new EmbedBuilder()
        .setTitle("Enter Card Brawl")
        .setDescription(
          `Cards Entered: ${cardsEntered}\n\n` +
            `You already entered **${numCardsEntered}** ${numCardsEntered > 1 ? "cards" : "card"} for the **${setupModel.name}** Card Brawl. Would you like to spend **${config.emoji.token} ${cost} Tokens** to enter another card?`
        );
      enterReply = {
        embeds: [enterEmbed],
        components: [row],
        allowedMentions: { parse: [] },
      };
    } else {
      // Display card brawl details
      enterEmbed = getEnterEmbed(setupModel);
      enterReply = {
        content: `<@${userID}>, is this the correct Card Brawl you want to enter?`,
        embeds: [enterEmbed],
        components: [row],
        allowedMentions: { parse: [] },
      };
    }

    let response = await interaction.reply(enterReply);

    // Update embed based on button press
    const collectorFilter = (i) => i.user.id === userID;
    let confirmation;
    try {
      confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        max: 1,
        time: 30_000,
      });
    } catch (error) {
      console.warn("[brawl/enter] Command timed out:", interaction.user.tag);

      enterEmbed.setColor(config.embed.red);
      enterReply.components = [];
      await response.update({
        enterReply,
      });

      return await interaction.followUp({
        content: "❌ Confirmation not received within `30 seconds`, cancelling.",
        ephemeral: true,
      });
    }

    // Confirmation received
    switch (confirmation.customId) {
      case "cancelEnter": {
        enterEmbed.setColor(config.embed.red);
        enterReply.components = [];
        return await confirmation.update(enterReply);
      }
      case "confirmEnter": {
        if (cost > 0) {
          const inventoryModel = await InventoryModel.findOne({
            userID,
          }).exec();

          if (!inventoryModel) {
            await interaction.followUp(`❌ You have no inventory.`);
            enterEmbed.setColor(config.embed.red);
            enterReply.components = [];
            return await confirmation.update(enterReply);
          }

          if (inventoryModel.numTokens < cost) {
            await interaction.followUp(`❌ You do not have enough tokens.`);
            enterEmbed.setColor(config.embed.red);
            enterReply.components = [];
            return await confirmation.update(enterReply);
          }
        }

        enterEmbed.setColor(config.embed.green);
        enterReply.components = [];
        await confirmation.update(enterReply);
        break;
      }
    }

    // Ask for card details
    await channel.send({
      content: `<@${userID}>, show the card you want to submit: \`kci <card code>\``,
      allowedMentions: { parse: [] },
    });

    // Read card details embed
    let collected;
    try {
      collected = await interaction.channel.awaitMessages({
        filter: (response) =>
          response.author.id === config.botID.karuta &&
          response.channelId === interaction.channel.id &&
          response.mentions.repliedUser &&
          response.mentions.repliedUser.id === userID &&
          response.embeds.length === 1 &&
          response.embeds[0].data.title === "Card Details" &&
          response.embeds[0].data.description.includes("Dropped in server ID"),
        max: 1,
        time: 60 * 1000,
      });

      if (collected.size === 0) {
        console.warn("[WARN] [enter] Command timed out:", interaction.user.tag);
        return await interaction.followUp({
          content: "❌ Confirmation not received within `1 minute`, cancelling.",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(`[ERROR] [enter]:`, error);
      return await interaction.followUp({
        content: "❌ An error occurred.",
        ephemeral: true,
      });
    }

    // Confirmation received
    console.log("[brawl/enter] Found Card Details embed for: " + interaction.user.tag);
    let embedMessage;
    try {
      embedMessage = collected.first();
    } catch (error) {
      return await interaction.followUp({
        content: "❌ Card embed not found.",
        ephemeral: true,
      });
    }
    const botResponseEmbed = embedMessage.embeds[0].data;
    const description = botResponseEmbed.description;

    // Find first match of regex to extract card code
    // Define a regular expression to match the content between backticks
    // Use the `exec` method to find the first match
    const regex = /`([^`]+)`/;
    const match = regex.exec(botResponseEmbed.description);
    if (!match) {
      console.warn(`[brawl/enter] Couldn't finding card code between backticks. Found "${cardCode}"`);
      return await embedMessage.reply(`❌ Error finding card code. Found \`${cardCode}\`.`);
    }
    const cardCode = match[1];

    // Check precondition
    if (setupModel.cards.get(cardCode)) {
      return await embedMessage.reply({
        content: `❌ <@${userID}>, this card is already submitted to this Card Brawl.`,
        allowedMentions: { parse: [] },
      });
    }

    // Check card requirements
    if (!description.includes(`Owned by <@${userID}>`)) {
      return await embedMessage.reply("❌ You do not own this card.");
    }
    if (setupModel.series !== null && !description.includes(setupModel.series)) {
      return await embedMessage.reply(`❌ This card is not from the \`${setupModel.series}\` series.`);
    }
    if (!description.includes(`Framed with`)) {
      return await embedMessage.reply("❌ This card is not framed.");
    }
    // if (!description.includes(`Morphed by`)) {
    //     return await embedMessage.reply("❌ This card is not morphed.");
    // }
    if (setupModel.sketch === "prohibited") {
      if (description.includes(`Sketched by`)) {
        return await embedMessage.reply("❌ This card is sketched.");
      }
    }

    // Change buttons
    if (cost > 0) {
      confirm.setLabel(`${cost}`);
      confirm.setEmoji(config.emoji.token);
    }

    // Display card confirmation
    const cardURL = botResponseEmbed.thumbnail.url;
    const cardEmbed = new EmbedBuilder().setColor(botResponseEmbed.color).setImage(cardURL);
    response = await channel.send({
      content: `<@${userID}>, is this the correct card you want to submit?`,
      embeds: [cardEmbed],
      components: [row],
      allowedMentions: { parse: [] },
    });

    // Collect button press interaction
    try {
      confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        max: 1,
        time: 60 * 1000,
      });
    } catch (error) {
      console.warn("[brawl/enter] Command timed out:", interaction.user.tag);

      cardEmbed.setColor(config.embed.red);
      await response.edit({
        content: `<@${userID}>, is this the correct card you want to submit?`,
        embeds: [cardEmbed],
        components: [],
        allowedMentions: { parse: [] },
      });

      return await interaction.followUp({
        content: "❌ Confirmation not received within `1 minute`, cancelling.",
        ephemeral: true,
      });
    }

    // Button press confirmed
    switch (confirmation.customId) {
      case "cancelEnter": {
        cardEmbed.setColor(config.embed.red);
        return await confirmation.update({
          content: `<@${userID}>, is this the correct card you want to submit?`,
          embeds: [cardEmbed],
          components: [],
          allowedMentions: { parse: [] },
        });
      }
      case "confirmEnter": {
        // Get the most recent setupModel queue to handle concurrent saving
        const brawlTask = async () => {
          // Get most recent setupModel at the head of the queue
          const recentSetupModel = await BrawlSetupModel.findOne().sort({
            _id: -1,
          });

          // Check eligibility again
          if (!recentSetupModel.open) {
            throw new Error(`❌ The **${recentSetupModel.name}** Card Brawl is closed!`);
          }

          if (recentSetupModel.cards.get(cardCode)) {
            throw new Error(`❌ <@${userID}>, this card is already submitted to this Card Brawl.`);
          }

          // Add card to map
          if (recentSetupModel.entries.get(userID)) {
            recentSetupModel.entries.get(userID).push(cardCode);
          } else {
            recentSetupModel.entries.set(userID, [cardCode]);
          }

          await downloadImage(cardURL, `${cardCode}.png`);

          const imageSchema = {
            imageLink: cardURL,
            userID: userID,
          };
          recentSetupModel.cards.set(cardCode, imageSchema);
          await recentSetupModel.save();

          // Update announcement embed
          const updatedEmbed = getAnnouncementEmbed(recentSetupModel);
          const competitorsChannel = client.channels.cache.get(config.channelID.brawlCompetitors);
          competitorsChannel.messages.fetch(recentSetupModel.messageID).then((message) => {
            message.edit({
              content: `Type \`/brawl enter\` to join this Card Brawl! 🥊 <@&${config.roleID.brawlCompetitor}>`,
              embeds: [updatedEmbed],
            });
          });
        };

        const tokenTask = async () => {
          const inventoryModel = await InventoryModel.findOne({
            userID,
          }).exec();

          if (!inventoryModel) {
            throw new Error(`❌ <@${userID}>, you have no inventory.`);
          }

          if (inventoryModel.numTokens < cost) {
            throw new Error(`❌ <@${userID}>, you do not have enough tokens to enter another card.`);
          }

          inventoryModel.numTokens -= cost;
          await inventoryModel.save();
        };

        // Add card to the brawl in database
        try {
          await client.setupModelQueue.enqueue(brawlTask);
          if (cost > 0) {
            await client.inventoryQueue.enqueue(tokenTask);
          }

          cardEmbed.setColor(config.embed.green);
          await confirmation.update({
            content: `<@${userID}>, is this the correct card you want to submit?`,
            embeds: [cardEmbed],
            components: [],
            allowedMentions: { parse: [] },
          });

          await channel.send(`✅ Successfully submitted \`${cardCode}\` to the **${setupModel.name}** Card Brawl!`);
        } catch (error) {
          console.error("[brawl/enter]:", error);

          cardEmbed.setColor(config.embed.red);
          await confirmation.update({
            content: `<@${userID}>, is this the correct card you want to submit?`,
            embeds: [cardEmbed],
            components: [],
            allowedMentions: { parse: [] },
          });

          return await channel.send({
            content: error.message,
            allowedMentions: { parse: [] },
          });
        }
        break;
      }
    }
    console.log(`[brawl/enter] Successfully submitted ${cardCode} to the ${setupModel.name} Card Brawl:`, interaction.user.tag);
  },
};
