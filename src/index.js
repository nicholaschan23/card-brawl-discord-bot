require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require("discord.js");
const {
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildMessageReactions,
    GuildScheduledEvents,
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
        MessageContent,
    ],
    partials: [User, Message, GuildMember],
});

// Connect to MongoDB
const { mongooseConnect } = require("./functions/mongooseConnect");
mongooseConnect();

// Handle concurrent saves to MongoDB
const TaskQueue = require("./classes/TaskQueue");
const setupModelQueue = new TaskQueue();
const userStatQueue = new TaskQueue();

client.events = new Collection();
client.cooldowns = new Collection();
client.commands = new Collection();

const { loadEvents } = require("./handlers/eventHandler");
loadEvents(client);

client.login(process.env.TOKEN);

const { autofeedInit } = require("./functions/autofeeds");
autofeedInit();

module.exports = { client, setupModelQueue, userStatQueue };
