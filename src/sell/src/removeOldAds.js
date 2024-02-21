const CardAdModel = require("../schemas/cardAdSchema");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

async function removeOldAds() {
    const channel = client.channels.cache.get(config.channelID.cardAds);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const timestampThreshold = Math.floor(oneWeekAgo.getTime() / 1000);

    // const deletedCodes = [];
    // let fetchedMessages;
    // try {
    //     const regex = /`([^`]+)`/;

    //     do {
    //         // Fetch messages over a week old
    //         fetchedMessages = await channel.messages.fetch({
    //             limit: 100, // Maximum number of messages to fetch at once
    //             before: oneWeekAgo,
    //         });

    //         // Store card codes that are going to be deleted
    //         fetchedMessages.forEach((message) => {
    //             if (message.embeds.length > 0) {
    //                 const embed = message.embeds[0];
    //                 const match = regex.exec(embed.description);
    //                 if (match) {
    //                     deletedCodes.push(match[1]);
    //                 }
    //             }
    //         });

    //         // Delete fetched messages
    //         if (fetchedMessages.size > 0) {
    //             await channel.bulkDelete(fetchedMessages);
    //             console.log(
    //                 `[INFO] [removeOldAds] Deleted ${fetchedMessages.size} messages.`
    //             );
    //         }
    //     } while (fetchedMessages.size > 0); // Continue while there are more messages fetched
    // } catch (error) {
    //     console.error("[ERROR] [removeOldAds] Error deleting messages:", error);
    // }

    // try {
    //     // MongoDB call to update the removed card ads
    //     if (deletedCodes.length > 0) {
    //         const task = async () => {
    //             await CardAdModel.deleteMany({ code: { $in: deletedCodes } });
    //         };
    //         await client.cardAdsQueue.enqueue(task);
    //     }
    // } catch (error) {
    //     console.error(
    //         "[ERROR] [removeOldAds] Error deleting models from MongoDB:",
    //         error
    //     );
    // }

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
            console.log(`Deleted ${messageIDsToDelete.size} messages.`);

            await CardAdModel.deleteMany({ code: { $lt: timestampThreshold } });
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
     * 1 hours (1 AM)
     * * any day of the month
     * * any month
     * * everyday
     */
    cron.schedule("0 1 * * *", async () => {
        removeOldAds();
    });

    console.log("[INFO] [removeOldAds] Scheduled remove old ads daily");
}

module.exports = { removeOldAds, scheduleRemoveOldAds };
