const { loadCommands } = require("../../handlers/commandHandler");
const client = require("../../index");

module.exports = {
    name: "ready",
    once: true,
    execute() {
        console.log(`Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");

        loadCommands(client);
    },
};
