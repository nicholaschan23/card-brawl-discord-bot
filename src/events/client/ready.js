const { Events } = require("discord.js");
const { loadCommands } = require("../../handlers/commandHandler");
const { loadSchedules } = require("../../functions/schedule/loadSchedules");
const { client } = require("../../index");
const config = require("../../../config.json")

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute() {
        console.log(`[READY] Client logged in as ${client.user.tag}`);
        client.user.setActivity("in the Far Shore");
        loadCommands(client);
        loadSchedules();

        const guild = client.guilds.cache.get(config.guildID);
        guild.members.fetch()
        guild.roles.fetch()
    },
};
