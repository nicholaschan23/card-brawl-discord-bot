const CardAdModel = require("../schemas/cardAdSchema");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

async function removeOldAds() {
    // Get timestamp from 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate());
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const timestampThreshold = Math.floor(twoWeeksAgo.getTime() / 1000);
    // const oneMonthAgo = new Date();
    // oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // const timestampThreshold = Math.floor(oneMonthAgo.getTime() / 1000);

    let totalMessagesDeleted = 0;
    const task = async () => {
        const batchSize = 100;
        const channel = client.channels.cache.get(config.channelID.cardAds);
        while (true) {
            // Query models with timestamp less than the threshold
            const modelsToDelete = await CardAdModel.find({
                timestamp: { $lt: timestampThreshold },
            }).limit(batchSize);

            if (modelsToDelete.length === 0) {
                break;
            }

            // Extract message IDs from the models
            const messageIDsToDelete = modelsToDelete.map((model) => model.messageID);

            if (modelsToDelete.length === 1) {
                const message = await channel.messages.fetch(messageIDsToDelete[0]);
                await message.delete();
            } else {
                // Delete the fetched messages
                try {
                    await channel.bulkDelete(messageIDsToDelete);
                } catch (error) {
                    console.error("[ERROR]:", error);

                    for (let i = 0; i < modelsToDelete.length; i++) {
                        const messageID = messageIDsToDelete[i];
                        const message = await channel.messages.fetch(messageID);
                        if (message) {
                            // console.log(`Deleted message ID: ${messageID}`);
                            await message.delete();
                        }
                    }
                }
            }

            // Delete the corresponding models from the database
            await CardAdModel.deleteMany({ messageID: { $in: messageIDsToDelete } });
            totalMessagesDeleted += modelsToDelete.length;
        }
    };

    try {
        await client.cardAdsQueue.enqueue(task);
        return totalMessagesDeleted;
    } catch (error) {
        console.log(`[ERROR] [removeOldAds]:`, error);
        return -1;
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
