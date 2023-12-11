const loadFiles = require("../src/fileLoader");

async function loadEvents(client) {
    console.time("[EVENT HANDLER] Events loaded");

    const tableArray = new Array();
    const eventFiles = [
        ...(await loadFiles("src/client/events")),
    ];
    for (const file of eventFiles) {
        try {
            const event = require(file);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            tableArray.push({ Event: event.name, Status: "✅" });
        } catch (error) {
            console.error(error);
            tableArray.push({ Event: file, Status: "❌" });
        }
    }

    console.table(tableArray, ["Event", "Status"]);
    console.timeEnd("[EVENT HANDLER] Events loaded");
}

module.exports = loadEvents;
