const cronParser = require("cron-parser");
const cron = require("node-cron");
const ScheduleModel = require("../schemas/scheduleSchema");

function hasCronPassed(cronExpression) {
    try {
        const interval = cronParser.parseExpression(cronExpression);
        const nextScheduledDate = interval.next().toDate();
        const currentDateTime = new Date();

        // Check if cron is in the last, current, or next month in the same year
        if (Math.abs(nextScheduledDate.getMonth() - currentDateTime.getMonth()) <= 1) {
            nextScheduledDate.setFullYear(currentDateTime.getFullYear());
        }

        return nextScheduledDate <= currentDateTime;
    } catch (error) {
        console.error(error);
    }
}

async function loadSchedules() {
    const schedules = await ScheduleModel.find();

    console.log(`[LOAD SCHEDULES] Loading ${schedules.length} schedules...`);
    try {
        for (const schedule of schedules) {
            const task = require(`../../${schedule.task}`);
            if (hasCronPassed(schedule.cron)) {
                console.log(`[INFO] [loadSchedules] Invoking ${schedule.name}`);
                task(schedule.data);
            } else {
                console.log(`[INFO] [loadSchedules] Scheduling ${schedule.name}`);
                cron.schedule(schedule.cron, () => {
                    task(schedule.data);
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
    console.log(`[INFO] [loadingSchedules] Successfully loaded ${schedules.length} schedules`);
}

module.exports = loadSchedules;
