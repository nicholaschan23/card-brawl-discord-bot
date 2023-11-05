const cron = require("node-cron");
const ScheduleModel = require("../../data/schemas/scheduleSchema");

async function loadSchedules() {
    try {
        console.log("[LOAD SCHEDULES] Loading schedules...");

        const schedules = await ScheduleModel.find();
        const currentDateTime = new Date();
        schedules.forEach((schedule) => {
            const nextScheduledDate = cron.schedule(schedule.cron).nextDate();

            console.log(
                `[LOAD SCHEDULES] Next scheduled date for ${schedule.name}:`,
                nextScheduledDate
            );
            if (nextScheduledDate <= currentDateTime) {
                // Execute the task immediately if the next scheduled date has passed
                console.log(`[LOAD SCHEDULES] Executing task for ${schedule.name} immediately`);
                const task = require(`./tasks/${schedule.task}`);
                task(schedule.data);
            } else {
                // Schedule the task as usual
                console.log(`[LOAD SCHEDULES] Scheduling ${schedule.name}`);
                cron.schedule(schedule.cron, () => {
                    const task = require(`./tasks/${schedule.task}`);
                    task(schedule.data);
                });
            }
        });
        console.log("[LOAD SCHEDULES] Successfully loaded schedules");
    } catch (error) {
        console.error("[LOAD SCHEDULES] Error loading schedules:", error);
    }
}

module.exports = { loadSchedules };
