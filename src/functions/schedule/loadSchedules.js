const cron = require("node-cron");
const ScheduleModel = require("../../data/schemas/scheduleSchema");

async function loadSchedules() {
    try {
        console.log("[INFO] Loading schedules...");
        const schedules = await ScheduleModel.find();
        schedules.forEach((schedule) => {
            console.log(`[INFO] Scheduling ${schedule.name}`);
            cron.schedule(schedule.cron, () => {
                const task = require(`./tasks/${schedule.task}`);
                task(schedule.data);
            });
        });
        console.log("[DONE] Loading schedules.");
    } catch (error) {
        console.error("[ERROR] Loading schedules:", error);
    }
}

module.exports = loadSchedules;
