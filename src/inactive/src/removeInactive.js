const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");
const getAnnouncementEmbed = require("../embeds/inactiveAnnouncement");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

function removeInactive() {
    const karutaUpdates = client.channels.cache.get(config.channelID.karutaUpdates);
    const karutaMain = client.channels.cache.get(config.channelID.karutaMain);
    const karutaDrop = client.channels.cache.get(config.channelID.karutaDrop);
    const guild = client.guilds.cache.get(config.guildID);
    const activePlayer = guild.roles.cache.get(config.roleID.activePlayer);

    /**
     * 0 minutes
     * 0 hours (12 AM)
     * * any day of the month
     * * any month
     * 0 day of the week (Sunday)
     */
    cron.schedule("0 0 * * 0", async () => {
        // Get the date 1 week ago
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate);
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        const weekAgoUnixTime = Math.floor(sevenDaysAgo.getTime() / 1000); // seconds

        const activePlayers = activePlayer.members;
        const total = activePlayers.size;

        for (const member of activePlayers) {
            try {
                const userID = member.user.id;
                const uim = await UserInventoryModel.findOne({ userID }).exec();
        
                if (uim.lastUnixTime < weekAgoUnixTime) {
                    playersRevoked++;
                    await member.roles.remove(activePlayer);
                }
            } catch (error) {
                console.error(
                    `[ERROR] [removeInactive] Failed to check active player status for: ${member.user.tag}`,
                    error
                );
            }
        }

        const embed = getAnnouncementEmbed(activePlayers.size, total - activePlayers.size);
        karutaUpdates.send({ embeds: [embed] });
        karutaMain.send({ embeds: [embed] });
        karutaDrop.send({ embeds: [embed] });
    });

    console.log("[INFO] [removeInactive] Scheduled remove inactive players weekly check")
}

module.exports = removeInactive;
