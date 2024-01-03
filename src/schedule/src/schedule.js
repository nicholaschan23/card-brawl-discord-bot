const {
    GuildScheduledEventManager,
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
} = require("discord.js");
const fs = require("fs");
const ScheduleModel = require("../schemas/scheduleSchema");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

// Unix timestamp must be in milliseconds
function unixTimeToCron(unixTime) {
    const date = new Date(unixTime);
    const month = date.getUTCMonth() + 1; // Months are 0-indexed, so add 1
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    // Format the components into a cron expression
    return `${minute} ${hour} ${day} ${month} *`;
}

// Outputs Unix timestamps in milliseconds
function getNextSaturday() {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getUTCDay();
    const daysUntilSaturday = 6 - currentDayOfWeek + (currentDayOfWeek === 6 ? 7 : 0);

    const nextSaturday = new Date(currentDate);
    nextSaturday.setUTCDate(currentDate.getUTCDate() + daysUntilSaturday);
    nextSaturday.setUTCHours(7 + 12, 0, 0, 0);
    const unixStartTime = Math.floor(nextSaturday.getTime() / 1000) * 1000;

    nextSaturday.setUTCHours(7 + 12, 30, 0, 0);
    const unixEndTime = Math.floor(nextSaturday.getTime() / 1000) * 1000;

    return { start: unixStartTime, end: unixEndTime };
}

async function createGuildEvent(setupModel) {
    const times = getNextSaturday();
    const unixStartTime = times.start; // Milliseconds
    const unixEndTime = times.end; // Milliseconds

    // Load image banner
    const imageBuffer = fs.readFileSync("./images/banner.png");

    // Create guild scheduled event
    const guild = client.guilds.cache.get(config.guildID);
    const eventManager = new GuildScheduledEventManager(guild);
    await eventManager.create({
        name: `${setupModel.name} Card Brawl`,
        scheduledStartTime: new Date(unixStartTime),
        scheduledEndTime: new Date(unixEndTime),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        description:
            `Get ready for a showdown of creativity in our card competition live event! It's your chance to showcase your card-styling skills and vote for your favorite designs. 🥊`,
            // `**Event Details**:\n` +
            // `Theme: ${setupModel.theme}\n` +
            // `Prize: <@&${config.roleID.brawlChampion}>\n` +
            // `Date: <t:${unixStartTime / 1000}:F>\n\n` +
            // `**How to Participate**:\n` +
            // `Be a competitor! See the <#${config.channelID.brawlCompetitors}> channel.\n` +
            // `Be a judge! See the <#${config.channelID.brawlJudges}> channel at the event start time.\n\n` +
            // `**Notifications**:\n` +
            // `Get the below roles in <id:customize> for reminders on Card Brawl events!\n` +
            // `<@&${config.roleID.brawlCompetitor}>: Get notified to submit cards to compete.\n` +
            // `<@&${config.roleID.brawlJudge}>: Get notified when the event goes live to vote.\n\n` +
            // `See you at the Card Brawl! 🥊`,
        entityMetadata: { location: `<#${config.channelID.brawlJudges}>` },
        image: imageBuffer,
        reason: "Create weekend Card Brawl scheduled event.",
    });
    console.log("[GUILD EVENT] Successfully created guild scheduled event");

    const remind24 = new ScheduleModel({
        name: "24H",
        task: "brawl/tasks/sendReminder",
        cron: `${unixTimeToCron(unixStartTime - 24 * 60 * 60 * 1000)}`,
        data: {
            message: `This is the last chance to enter the Card Brawl! Submissions close in \`1 day\`. <@&${config.roleID.brawlCompetitor}>`,
            scheduleName: "24H",
        },
    });
    await remind24.save();
    console.log("[GUILD EVENT] Defined 24 hour reminder schema");
    cron.schedule(remind24.cron, () => {
        task(remind24.data);
    });

    const remind1 = new ScheduleModel({
        name: "1H",
        task: "brawl/tasks/sendReminder",
        cron: `${unixTimeToCron(unixStartTime - 60 * 60 * 1000)}`,
        data: {
            message: `The Card Brawl will be starting soon! Be back in \`1 hour\`. <@&${config.roleID.brawlJudge}>`,
            scheduleName: "1H",
        },
    });
    await remind1.save();
    console.log("[GUILD EVENT] Defined 1 hour reminder schema");
    cron.schedule(remind1.cron, () => {
        task(remind1.data);
    });

    const start = new ScheduleModel({
        name: setupModel.name,
        task: "brawl/tasks/startBrawl",
        cron: `${unixTimeToCron(unixStartTime)}`,
        data: { name: setupModel.name, scheduleName: setupModel.name },
    });
    await start.save();
    console.log("[GUILD EVENT] Defined start schema");
    cron.schedule(start.cron, () => {
        task(start.data);
    });
}

module.exports = { unixTimeToCron, getNextSaturday, createGuildEvent };
