const cron = require("node-cron");
const ScheduleModel = require("../../data/schemas/scheduleSchema");

async function loadSchedules() {
    try {
        console.log("[LOAD SCHEDULES] Loading schedules...");
        const schedules = await ScheduleModel.find();
        schedules.forEach((schedule) => {
            console.log(`[LOAD SCHEDULES] Scheduling ${schedule.name}`);
            cron.schedule(schedule.cron, () => {
                const task = require(`./tasks/${schedule.task}`);
                task(schedule.data);
            });
        });
        console.log("[LOAD SCHEDULES] Successfully loaded schedules");
    } catch (error) {
        console.error("[LOAD SCHEDULES] Error loading schedules:", error);
    }
}

module.exports = { loadSchedules };
