require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require("discord.js");
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [User, Message, GuildMember],
});

// Connect to MongoDB
try {
    const database = require("./functions/database");
    database.run().catch(console.dir);
} catch (error) {
    console.log(error);
}

client.events = new Collection();
client.cooldowns = new Collection();
client.commands = new Collection();

const { loadEvents } = require("./handlers/eventHandler");
loadEvents(client);

client.login(process.env.TOKEN);

module.exports = client;
