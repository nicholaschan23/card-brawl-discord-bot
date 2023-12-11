const ScheduleModel = require("../../schedule/schemas/scheduleSchema");
const client = require("../../index");
const config = require("../../../config.json");

async function reminder(data) {
    const channel = await client.channels.fetch(config.channelID.judges);
    await channel.send({
        content: data.message,
    });

    // Delete schedule
    const name = data.scheduleName;
    try {
        await ScheduleModel.deleteOne({ name }).exec();
        console.log(`[INFO] [sendReminder] ${name} schedule deleted`);
    } catch (error) {
        console.error(`[ERROR] [sendReminder] Error deleting schedule ${name}:`, error);
    }
}

module.exports = reminder;
