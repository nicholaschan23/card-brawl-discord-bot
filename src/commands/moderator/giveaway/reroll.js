const { SlashCommandSubcommandBuilder } = require("discord.js");
const GiveawayModel = require("../../../giveaway/schemas/giveawaySchema");
const getWinnerEmbed = require("../../../giveaway/embeds/giveawayWinner");
const rollWinner = require("../../../giveaway/src/rollWinner");
const client = require("../../../index");
const config = require("../../../../config.json");

module.exports = {
    category: "moderator/giveaway",
    data: new SlashCommandSubcommandBuilder()
        .setName("reroll")
        .setDescription("Reroll a giveaway winner.")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("Message ID of the giveaway.")
                .setRequired(true)
        ),
    async execute(interaction) {
        // Get giveaway model
        const messageID = interaction.options.getString("id");
        const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
        if (!giveawayModel) {
            console.warn(`[WARN] [reroll] The ${messageID} giveaway does not exist`);
            return await interaction.reply("This giveaway does not exist.");
        }

        // Check if giveaway is closed
        if (giveawayModel.open) {
            console.warn("[WARN] [reroll] The giveaway has not ended yet");
            return await interaction.reply("This giveaway has not ended yet.");
        }

        // Announce winner
        const winnerArray = await rollWinner(giveawayModel, 1);
        if (!winnerArray) {
            console.warn(
                "[WARN] [reroll] There are no more participants to roll as winners"
            );
            return await interaction.reply(
                "There are no more participants to roll as winners."
            );
        }
        const winnerMentions = `<@${winnerArray[0]}>`;
        const channel = await client.channels.fetch(config.channelID.giveaway);
        await channel.send({
            content: `Congrats to ${winnerMentions}! 🎉`,
            embeds: [
                getWinnerEmbed(
                    winnerMentions,
                    giveawayModel.host,
                    messageID,
                    giveawayModel.prize
                ),
            ],
        });
    },
};
