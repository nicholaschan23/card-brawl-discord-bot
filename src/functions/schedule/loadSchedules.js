const cron = require("node-cron");
const ScheduleModel = require("../../data/schemas/scheduleSchema");

async function loadSchedules() {
    try {
        console.time("[LOAD SCHEDULES] Loading schedules...");
        const schedules = await ScheduleModel.find();
        schedules.forEach((schedule) => {
            console.log(`[LOAD SCHEDULES] Scheduling ${schedule.name}`);
            cron.schedule(schedule.cron, () => {
                const task = require(`./tasks/${schedule.task}`);
                task(schedule.data);
            });
        });
        console.time("[LOAD SCHEDULES] Loading schedules");
    } catch (error) {
        console.error("[ERROR] Couldn't load schedules:", error);
    }
}

module.exports = loadSchedules;
