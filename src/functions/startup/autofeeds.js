const cron = require("node-cron");
const config = require("../../../config.json");
const { GuildScheduledEvent } = require("discord.js");

function autofeedInit(client) {
    const guild = client.guilds.cache.get(config.guildID);
    const karutaDrop = client.channels.cache.get(config.karutaDropChannelID);

    // Karuta ping roles
    cron.schedule("0 * * * *", () => {
        try {
            const serverDrop = guild.roles.cache.find(
                (r) => r.name === "Server Drop"
            );
            const wishlistDrop = guild.roles.cache.find(
                (r) => r.name === "Wishlist Drop"
            );
            const eventDrop = guild.roles.cache.find(
                (r) => r.name === "Event Drop"
            );
            karutaDrop.send({
                content: `:shinto_shrine: Want to get pinged for <@&${serverDrop.id}>, <@&${wishlistDrop.id}>, or <@&${eventDrop.id}>? Use command \`/role add\`!`,
                allowedMentions: { parse: [] },
            });
        } catch (error) {
            console.log("Error sending ping roles reminder: " + error);
        }
    });

    // Card Brawl promotion
    cron.schedule("30 * * * *", async () => {
        try {
            const events = await guild.scheduledEvents.fetch();
            events.array.forEach(event => {
                const link = `https://discord.gg/farshore?event=${event.id}`
                karutaDrop.send({
                    content: `:shinto_shrine: **Participate in the community (card competition)[${link}] this weekend!** Don't want to be a <@&${config.competitorRole}>, be a <@&${eventDrop.id}>! Get roles in <id:customize>.`,
                    allowedMentions: { parse: [] },
                });
            });
        } catch (error) {
            console.log("Error sending Card Brawl reminder: " + error);
        }
    });

    // Karuta help
    cron.schedule("0 */2 * * *", () => {
        try {
            karutaDrop.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in <#1023740163857338478>!`
            );
        } catch (error) {
            console.log("Error sending karuta help reminder: " + error);
        }
    });
}

module.exports = { autofeedInit };
