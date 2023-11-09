const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    name: String, // Name for the schedule
    cron: String, // Cron expression
    task: String, // Function name to execute
    data: Object, // Any additional data
});

const ScheduleModel = mongoose.model("schedule", scheduleSchema);

module.exports = ScheduleModel;
