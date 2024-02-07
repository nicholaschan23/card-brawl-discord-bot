const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");
const getAnnouncementEmbed = require("../embeds/inactiveAnnouncement");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

async function removeInactive() {
    const guild = client.guilds.cache.get(config.guildID);
    const activePlayerRole = guild.roles.cache.get(config.roleID.activePlayer);

    // Get the date 1 week ago
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    const weekAgoUnixTime = Math.floor(sevenDaysAgo.getTime() / 1000); // seconds

    const activePlayerMembers = activePlayerRole.members;
    const total = activePlayerMembers.size;
    let totalInactive = 0;
    for (const memberArr of activePlayerMembers) {
        try {
            const userID = memberArr[0];
            const uim = await UserInventoryModel.findOne({ userID }).exec();

            if (uim.lastUnixTime < weekAgoUnixTime) {
                totalInactive++;
                const member = guild.members.cache.get(userID);
                await member.roles.remove(activePlayerRole);
            }
        } catch (error) {
            console.error(
                `[ERROR] [removeInactive] Failed to check active player status for: ${memberArr[1].user.tag}`,
                error
            );
        }
    }

    // Send results messages to the below channels
    const karutaUpdates = client.channels.cache.get(config.channelID.karutaUpdates);
    const karutaMain = client.channels.cache.get(config.channelID.karutaMain);
    const karutaDrop = client.channels.cache.get(config.channelID.karutaDrop);
    const embed = getAnnouncementEmbed(total - totalInactive, totalInactive);
    karutaUpdates.send({ embeds: [embed] });
    karutaMain.send({ embeds: [embed] });
    karutaDrop.send({ embeds: [embed] });
}

function scheduleRemoveInactive() {
    /**
     * 0 minutes
     * 0 hours (12 AM)
     * * any day of the month
     * * any month
     * 0 day of the week (Sunday)
     */
    cron.schedule("0 0 * * 0", async () => {
        removeInactive();
    });

    console.log("[INFO] [removeInactive] Scheduled remove inactive players weekly check");
}

module.exports = { removeInactive, scheduleRemoveInactive };
