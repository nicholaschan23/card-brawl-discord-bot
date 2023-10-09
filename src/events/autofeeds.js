const cron = require("node-cron");
const { client } = require("../index");
const config = require("../../config.json");

module.exports = {
    name: "autofeeds",
    once: true,
    execute() {
        const guild = client.guilds.cache.get(config.guildID);
        const karutaDrop = client.channels.cache.get(
            config.karutaDropChannelID
        );

        // Karuta ping roles
        cron.schedule("0 * * * *", () => {
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
        });

        // Card Brawl promotion
        cron.schedule("30 * * * *", () => {
            if (guild.scheduledEvents()) {
                karutaDrop.send({
                    content: `:shinto_shrine: **Go to <#${config.competitorsChannelID}> to enter our card competition this weekend!** Don't want to be a <@&${config.competitorRole}>, be a <@&${eventDrop.id}>! Get roles in <id:customize>.`,
                    allowedMentions: { parse: [] },
                });
            }
        });

        // Karuta help
        cron.schedule("0 */2 * * *", () => {
            karutaDrop.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in <#1023740163857338478>!`
            );
        });
    },
};
