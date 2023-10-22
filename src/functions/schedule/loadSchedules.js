const cron = require("node-cron");
const ScheduleModel = require("../../data/schemas/scheduleSchema");

async function loadSchedules() {
    try {
        console.group("[LOAD SCHEDULES] Loading schedules...");
        const schedules = await ScheduleModel.find();
        schedules.forEach((schedule) => {
            console.log(`Scheduling ${schedule.name}`);
            cron.schedule(schedule.cron, () => {
                const task = require(`./tasks/${schedule.task}`);
                task(schedule.data);
            });
        });
        console.log("Successfully loaded schedules");
        console.groupEnd();
    } catch (error) {
        console.error("[LOAD SCHEDULES] Error loading schedules:", error);
    }
}

module.exports = loadSchedules;
