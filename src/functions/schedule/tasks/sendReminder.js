const { client } = require("../../../index");
const config = require("../../../../config.json");
const ScheduleModel = require("../../../data/schemas/scheduleSchema");

async function reminder(data) {
    const judgesChannel = client.channels.cache.get(config.judgesChannelID);
    await judgesChannel.send({
        content: data.message,
    });

    // Delete schedule
    try {
        const name = data.scheduleName;
        await ScheduleModel.deleteOne({ name }).exec();
        console.log(`[INFO] ${name} schedule deleted.`);
    } catch (error) {
        console.error(`[ERROR] Deleting schedule ${name}:`, error);
    }
}

module.exports = reminder;
