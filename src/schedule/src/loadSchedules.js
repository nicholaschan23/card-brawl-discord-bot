const cron = require("node-cron");
const ScheduleModel = require("../schemas/scheduleSchema");

// TODO: Implement auto-deleting schedules
function hasCronPassed(cronExpression) {
    try {
        const cronSchedule = cron.schedule(cronExpression);
        const nextScheduledDate = cronSchedule.nextDate();
        const currentDateTime = new Date();
        console.log(nextScheduledDate);
        console.log(currentDateTime);

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
            console.log(`[LOAD SCHEDULES] Scheduling ${schedule.name}`);
            cron.schedule(schedule.cron, () => {
                task(schedule.data);
            });
        }
    } catch (error) {
        console.error(error);
    }
    console.log(`[LOAD SCHEDULES] Successfully loaded ${schedules.length} schedules`);
}

module.exports = loadSchedules;
