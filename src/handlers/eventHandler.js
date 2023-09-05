const { loadFiles } = require("../functions/fileLoader");

async function loadEvents(client) {
    console.time("Events loaded");

    client.events = new Map();
    const tableArray = new Array();

    const eventFiles = await loadFiles("src/events");
    for (const file of eventFiles) {
        try {
            const event = require(file);

            const execute = (...args) => event.execute(...args, client); // accepts any number of arguments, calls event.execute function with those
            const target = event.rest ? client.rest : client;
            target[event.once ? "once" : "on"](event.name, execute);
            client.events.set(event.name, execute); // creates new entry in Collection (event name, execute function)

            tableArray.push({ Event: event.name, Status: "✅" });
        } catch (error) {
            tableArray.push({ Event: file, Status: "❌" });
        }
    }

    console.table(tableArray, ["Event", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Events."); // Cyan
    console.timeEnd("Events loaded");
}

module.exports = { loadEvents };
