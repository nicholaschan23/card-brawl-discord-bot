const { Events } = require("discord.js");
const autofeedInit = require("../src/autofeeds");
const removeInactive = require("../../inactive/src/removeInactive")
const loadCommands = require("../handlers/commandHandler");
const loadSchedules = require("../../schedule/src/loadSchedules");
const client = require("../../index");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        console.log(`[READY] Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");

        loadCommands();
        loadSchedules();
        autofeedInit();
        removeInactive();
    },
};
