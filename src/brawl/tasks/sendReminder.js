const client = require("../../index");
const config = require("../../../config.json");
const ScheduleModel = require("../../../data/schemas/scheduleSchema");

async function reminder(data) {
    const judgesChannel = client.channels.cache.get(config.judgesChannelID);
    await judgesChannel.send({
        content: data.message,
    });

    // Delete schedule
    const name = data.scheduleName;
    try {
        await ScheduleModel.deleteOne({ name }).exec();
        console.log(`[SEND REMINDER] ${name} schedule deleted`);
    } catch (error) {
        console.error(`[SEND REMINDER] Error deleting schedule ${name}:`, error);
    }
}

module.exports = reminder;
