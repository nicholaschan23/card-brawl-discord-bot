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

const { guildID, clientID } = require("../config.json");
const config = {
    guildID: guildID,
    clientID: clientID,
    developerID: "195592343771021312",
    globalCooldown: 10,
    serverShop: "https://discord.com/channels/727898987285315736/shop",
    botID: {
        starflight: "816328822051045436",
        karuta: "646937666251915264",
        sofi: "853629533855809596",
        tofu: "792827809797898240",
        gachapon: "815289915557675118",
    },
    channelID: {
        brawlInfo: "1153360255158321162",
        brawlAnnouncement: "1157476974671958016",
        brawlCompetitors: "1152363749966102559",
        brawlJudges: "1152352856247119953",
        karuta: "1157474189024972860",
        karutaDrop: "768727462221578260",
        giveaway: "1117827373325369384",
        giveawayClaim: "1153087079736168478",
    },
    // channel: {
    //     brawlInfo: guild.channels.cache.get(config.channelID.brawlInfo),
    //     brawlAnnouncement: guild.channels.cache.get(
    //         config.channelID.brawlAnnouncement
    //     ),
    //     brawlCompetitors: guild.channels.cache.get(config.channelID.brawlInfo),
    //     brawlJudges: guild.channels.cache.get(config.channelID.brawlJudge),
    //     karuta: guild.channels.cache.get(config.channelID.karuta),
    //     karutaDrop: guild.channels.cache.get(config.channelID.karutaDrop),
    //     giveaway: guild.channels.cache.get(config.channelID.giveaway),
    //     giveawayClaim: guild.channels.cache.get(config.channelID.giveawayClaim),
    // },
    roleID: {
        giveaway: "1117829641336528956",
        activeDropper: "1182184357553787000",

        // Server supporters
        serverBooster: "814708993393426482",
        activeBooster: "776543515735883828",
        serverSubscriber: "1153438565796155405",

        // Brawl
        brawlCompetitor: "1157371773009006703",
        brawlJudge: "1143997170731729046",
        brawlChampion: "1158801902939672668",

        // Karuta drop pings
        serverDrop: "1160350696923734186",
        wishlistDrop: "1160350192579649626",
        eventDrop: "1160350076695232593",

        // Color
        red: "1172024340561276958",
        pink: "1171094203418279996",
        purple: "1170812383724318792",
        deepPurple: "1170812552037552148",
        indigo: "1170812645826375740",
        blue: "1170808441292472410",
        lightBlue: "1171111213434937364",
        cyan: "1170808498959953990",
        teal: "1170808456031256757",
        green: "1170808537283313664",

        neonRed: "1172019995610456065",
        neonPink: "1172007720350662726",
        neonPurple: "1172005307057180723",
        neonDeepPurple: "1172006499699134565",
        neonIndigo: "1172006981100388382",
        neonBlue: "1172007080979333171",
        neonLightBlue: "1172007761056379000",
        neonCyan: "1172007254183137290",
        neonTeal: "1172007373355888770",
        neonGreen: "1172007491010314240",
    },
    // role: {
    //     giveaway: guild.roles.cache.get(config.roleID.giveaway),
    //     activeDropper: guild.roles.cache.get(config.roleID.activeDropper),

    //     // Server supporters
    //     serverBooster: guild.roles.cache.get(config.roleID.serverBooster),
    //     activeBooster: guild.roles.cache.get(config.roleID.activeBooster),
    //     serverSubscriber: guild.roles.cache.get(config.roleID.serverSubscriber),

    //     // Brawl
    //     brawlCompetitor: guild.roles.cache.get(config.roleID.brawlCompetitor),
    //     brawlJudge: guild.roles.cache.get(config.roleID.brawlJudge),
    //     brawlChampion: guild.roles.cache.get(config.roleID.brawlChampion),

    //     // Karuta drop pings
    //     serverDrop: guild.roles.cache.get(config.roleID.serverDrop),
    //     wishlistDrop: guild.roles.cache.get(config.roleID.wishlistDrop),
    //     eventDrop: guild.roles.cache.get(config.roleID.eventDrop),
    // },
    color: {
        cost: 3,
        neonCost: 30,
    },
    emoji: {
        token: "<:Token:1169794021435117640>",
    },
    brawl: {
        voteTime: 30,
        startTime: 300,

        // Entry bonus
        serverSubscriberEntry: 5,

        // Vote bonuses
        activeBoosterBonus: 1,
        serverSubscriberBonus: 1,
    },
    embed: {
        blue: "#7289da",
        green: "#43b581",
        red: "#f04747",
        yellow: "#faa61a",
    },
    giveaway: {
        percentYield: 10,

        // Entry capacities
        everyoneCap: 1,
        serverBoosterCap: 2,
        activeBoosterCap: 3,
        serverSubscriberCap: 5,
    },
};

module.exports = { client, config };
