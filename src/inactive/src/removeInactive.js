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
    cron.schedule("0 0 * * 0", () => {
        const activePlayers = activePlayer.members;

        let playersRevoked = 0;
        activePlayers.forEach(async (member) => {
            try {
                const userID = member.user.id;
                const uim = await UserInventoryModel.findOne({ userID }).exec();

                if (uim.numTokens === 0) {
                    playersRevoked++;
                    member.roles.remove(activePlayer);
                } else {
                    uim.numTokens--;
                    const task = async () => {
                        await uim.save();
                    };
                    await client.inventoryQueue.enqueue(task);
                }
            } catch (error) {
                console.error(
                    `[ERROR] [removeInactive] Failed to check active player status for: ${member.user.tag}`,
                    error
                );
            }
        });

        const embed = getAnnouncementEmbed(activePlayers.size, playersRevoked);
        karutaUpdates.send({ embeds: [embed] });
        karutaMain.send({ embeds: [embed] });
        karutaDrop.send({ embeds: [embed] });
    });
}

module.exports = removeInactive;
