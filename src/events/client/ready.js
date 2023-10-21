const { Events } = require("discord.js");
const { loadCommands } = require("../../handlers/commandHandler");
const loadSchedules = require("../../functions/schedule/loadSchedules");
const { client } = require("../../index");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        console.log(`[INFO] Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");
        loadCommands(client);
        loadSchedules();
    },
};
