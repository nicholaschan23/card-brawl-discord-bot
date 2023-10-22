const {
    GuildScheduledEventManager,
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
} = require("discord.js");
const loadSchedules = require("./loadSchedules");
const { client } = require("../../index");
const config = require("../../../config.json");
const ScheduleModel = require("../../data/schemas/scheduleSchema");
const fs = require("fs");

function unixTimestampToCron(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const month = date.getUTCMonth() + 1; // Months are 0-indexed, so add 1
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();

    // Format the components into a cron expression
    return `${minute} ${hour} ${day} ${month} *`;
}

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
    const unixStartTime = times.start;
    const unixEndTime = times.end;

    // Load image banner
    const imageBuffer = fs.readFileSync("./images/banner.png");

    // Create guild scheduled event
    const guild = client.guilds.cache.get(config.guildID);
    const eventManager = new GuildScheduledEventManager(guild);
    const event = await eventManager.create({
        name: `${setupModel.name} Card Brawl`,
        scheduledStartTime: new Date(unixStartTime),
        scheduledEndTime: new Date(unixEndTime),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        description: `Get ready for a showdown of creativity in our card competition live event! It's your chance to showcase your card-styling skills and vote for your favorite designs. 🥊\n\n**Event Details**:\nTheme: ${
            setupModel.theme
        }\nPrize: <@&${config.brawlChampionRole}>\nDate: <t:${
            unixStartTime / 1000
        }:F>\n\n**How to Participate**:\nBe a competitor! See the <#${
            config.competitorsChannelID
        }> channel.\nBe a judge! See the <#${
            config.judgesChannelID
        }> channel at the event start time.\n\n**Notifications**:\nGet the below roles in <id:customize> for reminders on Card Brawl events!\n<@&${
            config.competitorRole
        }>: Get notified to submit cards to compete.\n<@&${
            config.judgeRole
        }>: Get notified when the event goes live to vote.\n\nSee you at the Card Brawl! 🥊`,
        entityMetadata: { location: `<#${config.judgesChannelID}>` },
        image: imageBuffer,
        reason: "Create weekend Card Brawl scheduled event.",
    });

    // Send scheduled event invite link
    const link = `https://discord.com/events/${config.guildID}/${event.id}`;
    const karutaUpdate = client.channels.cache.get(config.karutaUpdateChannelID);
    const brawlAnnounce = client.channels.cache.get(config.brawlAnnouncementChannelID);
    karutaUpdate.send({
        content: `**Participate in the community [card competition](${link}) this weekend!** Visit the <#${config.competitorsChannelID}> to learn more.`,
        allowedMentions: { parse: [] },
    });
    brawlAnnounce.send({
        content: `**Participate in the community [card competition](${link}) this weekend!** Visit the <#${config.competitorsChannelID}> to learn more.`,
        allowedMentions: { parse: [] },
    });

    const remind24 = new ScheduleModel({
        name: `Reminder ${setupModel.name}`,
        task: "sendReminder",
        cron: `${unixTimestampToCron(unixStartTime - 3600000 * 24)}`,
        data: {
            message: `This is the last chance to enter the Card Brawl! Submissions close in \`1 day\`. <@&${config.competitorRole}>`,
            scheduleName: `Reminder ${setupModel.name}`,
        },
    });
    await remind24.save();

    const remind1 = new ScheduleModel({
        name: `Reminder ${setupModel.name}`,
        task: "sendReminder",
        cron: `${unixTimestampToCron(unixStartTime - 3600000)}`,
        data: {
            message: `The Card Brawl will be starting soon! Be back in \`1 hour\`. <@&${config.judgeRole}>`,
            scheduleName: `Reminder ${setupModel.name}`,
        },
    });
    await remind1.save();

    const start = new ScheduleModel({
        name: `Start ${setupModel.name}`,
        task: "startBrawl",
        cron: `${unixTimestampToCron(unixStartTime)}`,
        data: { name: setupModel.name, scheduleName: `Start ${setupModel.name}` },
    });
    await start.save();

    loadSchedules();
}

module.exports = { createGuildEvent, getNextSaturday, unixTimestampToCron };
