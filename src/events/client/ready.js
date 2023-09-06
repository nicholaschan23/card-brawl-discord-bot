const { loadCommands } = require("../../handlers/commandHandler");
const { Events } = require("discord.js")
const client = require("../../index");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        console.log(`Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");
        loadCommands(client);
    },
};
