const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

function autofeedInit() {
    const guild = client.guilds.cache.get(config.guildID);
    const karutaDrop = client.channels.cache.get(config.channelID.karutaDrop);

    // Karuta drop roles
    cron.schedule("0 * * * *", () => {
        try {
            karutaDrop.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.serverDrop}?, <@&${config.roleID.wishlistDrop}>, or <@&${config.roleID.eventDrop}>? Use command \`/role drop\`!`,
                allowedMentions: { parse: [] },
            });
            console.log("[INFO] [autofeed] Sent 'Karuta drop roles' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Error sending 'Karuta drop roles' reminder:",
                error
            );
        }
    });

    // Color roles
    cron.schedule("10 * * * *", () => {
        try {
            karutaDrop.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            console.log("[INFO] [autofeed] Sent 'color roles' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Error sending 'color roles' reminder:",
                error
            );
        }
    });

    // Card Brawl promotion
    cron.schedule("15 * * * *", async () => {
        try {
            let events = await guild.scheduledEvents.fetch();
            events = [...events.values()];
            events.forEach((event) => {
                if (event.name.includes("Card Brawl")) {
                    const link = `https://discord.com/events/${config.guildID}/${event.id}`;
                    karutaDrop.send({
                        content: `:shinto_shrine: **Participate in the community [card competition](${link}) this weekend!** Visit <#${config.channelID.competitors}> to learn more. Click the button below to show you're interested.`,
                    });
                    console.log("[INFO] [autofeed] Sent 'Card Brawl promotion' reminder");
                    return;
                }
            });
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Error sending 'Card Brawl promotion' reminder:",
                error
            );
        }
    });

    // Karuta help
    cron.schedule("30 * * * *", () => {
        try {
            karutaDrop.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in the <#1023740163857338478> channel!`
            );
            console.log("[INFO] [autofeed] Sent 'Karuta help' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Error sending 'Karuta help' reminder:",
                error
            );
        }
    });

    // Karuta wishlist
    cron.schedule("45 * * * *", () => {
        try {
            karutaDrop.send(
                `:shinto_shrine: **Set your wishlist watch channel here!** Use command \`kww\`!`
            );
            console.log("[INFO] [autofeed] Sent 'Karuta wishlist' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Error sending 'Karuta wishlist' reminder:",
                error
            );
        }
    });
}

module.exports = autofeedInit;
