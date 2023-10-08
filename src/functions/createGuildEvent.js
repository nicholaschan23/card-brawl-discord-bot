const {
    GuildScheduledEventManager,
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
} = require("discord.js");
const config = require("../../config.json");
const { client } = require("../index");
const fs = require("fs");

// async function sendReminder(name) {
//     const brawlArena = client.channels.cache.get(config.brawlArena);
//     await brawlArena.send(
//         `The **${name}** Card Brawl will be starting in \`30 minutes\`! <@&${config.judgeRole}>`
//     );
// }

function getNextSaturday() {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getUTCDay();
    const daysUntilSaturday = 6 - currentDayOfWeek + (currentDayOfWeek === 6 ? 7 : 0);

    const nextSaturday = new Date(currentDate);
    nextSaturday.setUTCDate(currentDate.getUTCDate() + daysUntilSaturday);
    nextSaturday.setUTCHours(7+12, 0, 0, 0);
    const unixTimestampStart = Math.floor(nextSaturday.getTime() / 1000) * 1000;

    nextSaturday.setUTCHours(7+12, 30, 0, 0);
    const unixTimestampEnd = Math.floor(nextSaturday.getTime() / 1000) * 1000;

    return { start: unixTimestampStart, end: unixTimestampEnd };
}

async function createGuildEvent(setupModel) {
    const times = getNextSaturday();
    const unixTimestampStart = times.start;
    const unixTimestampEnd = times.end;

    // Load image banner
    const imageBuffer = fs.readFileSync("./images/banner.png");

    // Create guild scheduled event
    const guild = client.guilds.cache.get(config.guildID);
    const eventManager = new GuildScheduledEventManager(guild);
    const event = await eventManager.create({
        name: `${setupModel.name} Card Brawl`,
        scheduledStartTime: new Date(unixTimestampStart),
        scheduledEndTime: new Date(unixTimestampEnd),
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        description: `Get ready for a showdown of creativity in our card competition live event! It's your chance to showcase your card-styling skills and vote for your favorite designs. 🥊\n\n**Event Details**:\nTheme: ${
            setupModel.theme
        }\nPrize: <@&${config.brawlChampionRole}>\nDate: <t:${
            unixTimestampStart / 1000
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
    const link = await event.createInviteURL({
        channel: config.judgesChannelID,
    });
    const karutaUpdate = client.channels.cache.get(
        config.karutaUpdateChannelID
    );
    const brawlAnnounce = client.channels.cache.get(
        config.brawlAnnouncementChannelID
    );
    karutaUpdate.send(link);
    brawlAnnounce.send(link);

    // try {
    //     const cronExpression = `30 ${
    //         nextSaturday.getHours() - 1
    //     } ${nextSaturday.getDate()} ${
    //         nextSaturday.getMonth() + 1
    //     } ${nextSaturday.getDay()}`;
    //     cron.schedule(cronExpression, sendReminder(setupModel.name));
    // } catch (error) {
    //     console.log(`Unable to schedule reminder: ` + error);
    // }
}

module.exports = { createGuildEvent, getNextSaturday };
