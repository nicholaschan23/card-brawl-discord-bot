const { loadFiles } = require("../functions/fileLoader");

async function loadCommands(client) {
    console.time("Commands loaded");

    const tableArray = new Array();
    const commandFiles = await loadFiles("src/commands");
    for (const file of commandFiles) {
        const command = require(file);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            tableArray.push({ Command: command.data.name, Status: "✅" });
        } else {
            // [WARNING] The command at ${file} is missing a required "data" or "execute" property.`
            tableArray.push({ Command: file, Status: "❌" });
        }
    }

    console.table(tableArray, ["Command", "Status"]);
    console.info("\n\x1b[36m%s\x1b[0m", "Loaded Commands."); // Cyan
    console.timeEnd("Commands loaded");
}

module.exports = { loadCommands };
