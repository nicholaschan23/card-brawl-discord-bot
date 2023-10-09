const cron = require("node-cron");
const config = require("../../../config.json");

function autofeedInit(client) {
    // Karuta ping roles
    const karutaRoles = (client, config) => {
        try {
            const guild = client.guilds.cache.get(config.guildID);
            const karutaDrop = client.channels.cache.get(
                config.karutaDropChannelID
            );

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
                content: `:shinto_shrine: Want to get notified for <@&${serverDrop.id}>, <@&${wishlistDrop.id}>, or <@&${eventDrop.id}>? Use command \`/role add\`!`,
                allowedMentions: { parse: [] },
            });
        } catch (error) {
            console.log("Error sending Karuta roles reminder: " + error);
        }
    };
    cron.schedule("0 * * * *", () => {
        karutaRoles(client);
    });

    // Card Brawl promotion
    const brawlPromotion = async (client, config) => {
        try {
            const guild = client.guilds.cache.get(config.guildID);
            const karutaDrop = client.channels.cache.get(
                config.karutaDropChannelID
            );

            let events = await guild.scheduledEvents.fetch();
            events = [...events.values()];
            events.forEach((event) => {
                if (event.name.includes("Card Brawl")) {
                    const link = `https://discord.com/events/${config.guildID}/${event.id}`;
                    karutaDrop.send({
                        content: `:shinto_shrine: **Participate in the community [card competition](${link}) this weekend!** Don't want to be a <@&${config.competitorRole}>? Be a <@&${config.judgeRole}>! Get roles in <id:customize>.`,
                        allowedMentions: { parse: [] },
                    });
                    return;
                }
            });
        } catch (error) {
            console.log("Error sending Card Brawl reminder: " + error);
        }
    };
    cron.schedule("15 * * * *", () => {
        brawlPromotion(client, config);
    });

    // Karuta help
    const karutaHelp = (client) => {
        try {
            const karutaDrop = client.channels.cache.get(
                config.karutaDropChannelID
            );
            karutaDrop.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in the <#1023740163857338478> channel!`
            );
        } catch (error) {
            console.log("Error sending Karuta help reminder: " + error);
        }
    };
    cron.schedule("30 * * * *", () => {
        karutaHelp(client);
    });

    // Karuta help
    const karutaWishlist = (client) => {
        try {
            const karutaDrop = client.channels.cache.get(
                config.karutaDropChannelID
            );
            karutaDrop.send(
                `:shinto_shrine: **Set your wishlist watch channel here!** Use command \`kww\`!`
            );
        } catch (error) {
            console.log("Error sending Karuta wishlist reminder: " + error);
        }
    };
    cron.schedule("45 * * * *", () => {
        karutaWishlist(client);
    });
}

module.exports = { autofeedInit };
