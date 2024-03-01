const CardAdModel = require("../schemas/cardAdSchema");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

async function removeOldAds() {
    const channel = client.channels.cache.get(config.channelID.cardAds);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const timestampThreshold = Math.floor(oneWeekAgo.getTime() / 1000);

    const task = async () => {
        // Query models with timestamp less than the threshold
        const modelsToDelete = await CardAdModel.find({
            timestamp: { $lt: timestampThreshold },
        });

        // Extract message IDs from the models
        const messageIDsToDelete = modelsToDelete.map((model) => model.messageID);

        // Bulk delete the fetched messages
        if (messageIDsToDelete.length > 0) {
            await channel.bulkDelete(messageIDsToDelete);
            console.log(`[INFO] [removeOldAds] Deleted ${messageIDsToDelete.length} messages.`);

            await CardAdModel.deleteMany({ timestamp: { $lt: timestampThreshold } });
        }
    };

    try {
        await client.cardAdsQueue.enqueue(task);
    } catch (error) {
        console.log(`[ERROR] [removeOldAds]:`, error);
    }
}

function scheduleRemoveOldAds() {
    /**
     * 0 minutes
     * 23 hours (11 PM)
     * * any day of the month
     * * any month
     * * everyday
     */
    cron.schedule("0 23 * * *", async () => {
        removeOldAds();
    });

    console.log("[INFO] [removeOldAds] Scheduled remove old ads daily");
}

module.exports = { removeOldAds, scheduleRemoveOldAds };
