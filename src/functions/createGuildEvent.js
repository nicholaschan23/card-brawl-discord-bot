const {
    GuildScheduledEventManager,
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
    MessageFlags,
} = require("discord.js");
const config = require("../../config.json");
const client = require("../index");
const fs = require("fs");

async function createGuildEvent(setupModel) {
    const guild = client.guilds.cache.get(config.guildID);
    const eventManager = new GuildScheduledEventManager(guild);

    // Get date of next Saturday
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const daysUntilSaturday =
        6 - currentDayOfWeek + (currentDayOfWeek === 6 ? 7 : 0);

    const nextSaturday = new Date(currentDate);
    nextSaturday.setDate(currentDate.getDate() + daysUntilSaturday);
    nextSaturday.setHours(15, 0, 0, 0);
    const unixTimestampStart = Math.floor(nextSaturday.getTime() / 1000) * 1000;
    nextSaturday.setHours(15, 30, 0, 0);
    const unixTimestampEnd = Math.floor(nextSaturday.getTime() / 1000) * 1000;

    // Load image banner
    const imageBuffer = fs.readFileSync("./images/banner.png");

    // Create guild scheduled event
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
        }:F>\n\n**How to Participate**:\nWant to be a competitor? See <#${
            config.announcementChannelID
        }> for instructions to submit your card designs.\nWant to be a judge? See <#${
            config.arenaChannelID
        }> at the designated start time.\n\n**Notifications**:\nGet the below roles in <id:customize> for reminders on Card Brawl events!\n<@&${
            config.competitorRole
        }>: Get notified to submit cards to compete.\n<@&${
            config.judgeRole
        }>: Get notified when the event goes live.\n\nSee you at the Card Brawl! 🥊`,
        entityMetadata: { location: `<#${config.arenaChannelID}>` },
        image: imageBuffer,
        reason: "Create weekend Card Brawl scheduled event.",
    });

    // Send scheduled event invite link
    const link = await event.createInviteURL({
        channel: config.arenaChannelID,
    });
    const karutaUpdate = client.channels.cache.get(
        config.karutaUpdateChannelID
    );
    const brawlAnnounce = client.channels.cache.get(
        config.brawlAnnouncementChannelID
    );
    // karutaUpdate.send(link);
    // brawlAnnounce.send(link);
    event.delete();
}

module.exports = { createGuildEvent };
