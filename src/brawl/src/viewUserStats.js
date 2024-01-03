const UserStatModel = require("../schemas/userStatSchema");
const getUserStatEmbed = require("../embeds/brawlUserStats");

async function viewUserStats(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const userID = interaction.user.id;

    try {
        const model = await UserStatModel.findOne({ userID }).exec();
        if (model) {
            await interaction.editReply({
                embeds: [getUserStatEmbed(model)],
            });
        } else {
            await interaction.editReply({
                content: `You have not participated in a Card Brawl yet.`,
            });
        }
    } catch (error) {
        console.error("[BRAWL STATS] Error retrieving UserStatModel:", error);
        await interaction.editReply(
            `Error retrieving user stats. Please notify <@${config.developerID}>.`
        );
    }
}

module.exports = viewUserStats;
