const cron = require("node-cron");
const cronParser = require('cron-parser');
const ScheduleModel = require("../schemas/scheduleSchema");

async function loadSchedules() {
    console.log("[LOAD SCHEDULES] Loading schedules...");
    try {
        const schedules = await ScheduleModel.find();
        const currentDateTime = new Date();

        schedules.forEach((schedule) => {
            const task = require(`../../${schedule.task}`);
            console.log(task)

            const nextScheduledDate = cronParser.parseExpression(schedule.cron).next();
            console.log(
                `[LOAD SCHEDULES] Next scheduled date for ${schedule.name}:`,
                nextScheduledDate
            );
            if (nextScheduledDate <= currentDateTime) {
                // Execute the task immediately if the next scheduled date has passed
                console.log(`[LOAD SCHEDULES] Executing task for ${schedule.name} immediately`);
                task(schedule.data);
            } 
            else {
                // Schedule the task as usual
                console.log(`[LOAD SCHEDULES] Scheduling ${schedule.name}`);
                cron.schedule(schedule.cron, () => {
                    task(schedule.data);
                });
            }
        });
        console.log("[LOAD SCHEDULES] Successfully loaded schedules");
    } catch (error) {
        console.error("[LOAD SCHEDULES] Error loading schedules:", error);
    }
}

module.exports = loadSchedules;
