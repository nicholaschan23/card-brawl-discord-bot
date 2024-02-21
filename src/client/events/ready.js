const { Events } = require("discord.js");
const loadAutofeed = require("../../schedule/src/loadAutofeed");
const { scheduleRemoveInactive } = require("../../inactive/src/removeInactive");
const { scheduleRemoveOldAds } = require("../../sell/src/removeOldAds")
const loadCommands = require("../handlers/commandHandler");
const loadSchedules = require("../../schedule/src/loadSchedules");
const client = require("../../index");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        console.log(`[INFO] [ready] Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");

        loadCommands();
        loadSchedules();
        loadAutofeed();
        scheduleRemoveInactive();
        scheduleRemoveOldAds();
    },
};
