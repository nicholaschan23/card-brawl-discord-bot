const { SlashCommandSubcommandBuilder } = require("discord.js");
const getWinnerEmbed = require("../../../giveaway/embeds/giveawayWinner");
const rollWinner = require("../../../giveaway/src/rollWinner");
const client = require("../../../index");
const config = require("../../../../config.json");
const GiveawayModel = require("../../../giveaway/schemas/giveawaySchema");

module.exports = {
    category: "moderator/giveaway",
    data: new SlashCommandSubcommandBuilder()
        .setName("reroll")
        .setDescription("Reroll a giveaway winner.")
        .addStringOption((option) =>
            option.setName("id").setDescription("Message ID of the giveaway.").setRequired(true)
        ),
    async execute(interaction) {
        // Moderator permissions
        if (!interaction.member.roles.cache.some((role) => role.name === "Owner")) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true,
            });
        }

        // Get giveaway model
        const messageID = interaction.options.getString("id");
        const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
        if (!giveawayModel) {
            console.warn(`[ROLL WINNER] The ${messageID} giveaway does not exist`);
            return await interaction.reply("This giveaway does not exist.");
        }

        // Check if giveaway is closed
        if (giveawayModel.open) {
            console.warn("[ROLL WINNER] The giveaway has not ended yet");
            return await interaction.reply("This giveaway has not ended yet.");
        }

        // Announce winner
        const winnerArray = await rollWinner(giveawayModel, 1);
        if (!winnerArray) {
            console.warn("[ROLL WINNER] There are no more participants to roll as winners");
            return await interaction.reply("There are no more participants to roll as winners.");
        }
        const winnerMentions = `<@${winnerArray[0]}>`;
        const channel = client.channels.cache.get(config.giveawayChannelID);
        await channel.send({
            content: `Congrats to ${winnerMentions}! 🎉`,
            embeds: [getWinnerEmbed(winnerMentions, giveawayModel.host, messageID, giveawayModel.prize)],
        });
    },
};
