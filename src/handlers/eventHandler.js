const { loadFiles } = require("../functions/fileLoader");

async function loadEvents(client) {
    console.time("Events loaded");

    const tableArray = new Array();
    const eventFiles = await loadFiles("src/events");
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
            tableArray.push({ Event: file, Status: "❌" });
        }
    }

    console.table(tableArray, ["Event", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Events."); // Cyan
    console.timeEnd("Events loaded");
}

module.exports = { loadEvents };
