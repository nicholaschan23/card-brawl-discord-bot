require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const {
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildMessageReactions,
    GuildScheduledEvents,
    GuildPresences,
    MessageContent,
} = GatewayIntentBits;
const { User, Message, GuildMember } = Partials;

const client = new Client({
    intents: [
        Guilds,
        GuildMembers,
        GuildMessages,
        GuildMessageReactions,
        GuildScheduledEvents,
        GuildPresences,
        MessageContent,
    ],
    partials: [User, Message, GuildMember],
});

// Handle concurrent saves to MongoDB
const TaskQueue = require("./client/classes/TaskQueue");
client.bracketModelQueue = new TaskQueue();
client.setupModelQueue = new TaskQueue();
client.userStatQueue = new TaskQueue();
client.giveawayQueue = new TaskQueue();
client.inventoryQueue = new TaskQueue();

client.events = new Collection();
client.cooldowns = new Collection();
client.commands = new Collection();

const loadEvents = require("./client/handlers/eventHandler");
loadEvents(client);

// Connect to MongoDB
const mongooseConnect = require("./client/src/mongooseConnect");
mongooseConnect();

client.login(process.env.TOKEN);

module.exports = client;
