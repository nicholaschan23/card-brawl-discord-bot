const { loadFiles } = require("../functions/loadFiles");

async function loadEvents(client) {
    console.time("Events loaded");

    client.events = new Map();
    const events = new Array();

    const files = await loadFiles("events");
    for (const file of files) {
        try {
            const event = require(file);

            const execute = (...args) => event.execute(...args, client); // accepts any number of arguments, calls event.execute function with those
            const target = event.rest ? client.rest : client;
            target[event.once ? "once" : "on"](event.name, execute);
            client.events.set(event.name, execute); // creates new entry in Collection (event name, execute function)

            events.push({ Event: event.name, Status: "🟢" });
        } catch (error) {
            events.push({
                Event: file.split("/").pop().slice(0, -3),
                Status: "🛑",
            });
        }
    }

    console.table(events, ["Event", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Events."); // Cyan
    console.timeEnd("Events loaded")

}

module.exports = { loadEvents };
