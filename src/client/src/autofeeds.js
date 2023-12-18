const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

function autofeedInit() {
    const guild = client.guilds.cache.get(config.guildID);
    const karutaMain = client.channels.cache.get(config.channelID.karutaMain);
    const karutaDrop = client.channels.cache.get(config.channelID.karutaDrop);
    const sofiDrop = client.channels.cache.get(config.channelID.sofiDrop);
    const tofuSummon = client.channels.cache.get(config.channelID.tofuSummon);
    const gachaponDrop = client.channels.cache.get(config.channelID.gachaponDrop);

    // Card bot roles
    cron.schedule("0 * * * *", () => {
        try {
            karutaMain.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.karutaDrop}>, <@&${config.roleID.karutaWishlist}>, or <@&${config.roleID.karutaEvent}>? Use command \`/role bot\`!`,
                allowedMentions: { parse: [] },
            });
            karutaDrop.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.karutaDrop}>, <@&${config.roleID.karutaWishlist}>, or <@&${config.roleID.karutaEvent}>? Use command \`/role bot\`!`,
                allowedMentions: { parse: [] },
            });
            sofiDrop.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.sofiWishlist}>? Use command \`/role bot\`!`,
                allowedMentions: { parse: [] },
            });
            tofuSummon.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.tofuDrop}> or <@&${config.roleID.tofuWishlist}>? Use command \`/role bot\`!`,
                allowedMentions: { parse: [] },
            });
            gachaponDrop.send({
                content: `:shinto_shrine: Want to get notified for <@&${config.roleID.gachaponDrop}> or <@&${config.roleID.gachaponWishlist}>? Use command \`/role bot\`!`,
                allowedMentions: { parse: [] },
            });
            console.log("[INFO] [autofeed] Sent 'card bot roles' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'card bot roles' reminder:",
                error
            );
        }
    });

    // Karuta main
    cron.schedule("5 * * * *", () => {
        try {
            karutaDrop.send({
                content: `:shinto_shrine: **Looking to gain access to ${karutaMain}?** Earn your first ${config.emoji.token}! See \`/help\` for more info.`,
            });
            console.log("[INFO] [autofeed] Sent 'Karuta main' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'Karuta main' reminder:",
                error
            );
        }
    });

    // Color roles
    cron.schedule("10 * * * *", () => {
        try {
            karutaMain.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            karutaDrop.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            sofiDrop.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            tofuSummon.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            gachaponDrop.send({
                content: `:shinto_shrine: **Looking to add a splash of color to your name?** Use command \`/role color\`!`,
            });
            console.log("[INFO] [autofeed] Sent 'color roles' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'color roles' reminder:",
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
                    karutaMain.send({
                        content: `:shinto_shrine: **Participate in the community [card competition](${link}) this weekend!** Visit <#${config.channelID.brawlCompetitors}> to learn more. Click the button below to show you're interested.`,
                    });
                    karutaDrop.send({
                        content: `:shinto_shrine: **Participate in the community [card competition](${link}) this weekend!** Visit <#${config.channelID.brawlCompetitors}> to learn more. Click the button below to show you're interested.`,
                    });
                    console.log("[INFO] [autofeed] Sent 'Card Brawl promotion' reminder");
                    return;
                }
            });
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'Card Brawl promotion' reminder:",
                error
            );
        }
    });

    // Karuta help
    cron.schedule("30 * * * *", () => {
        try {
            karutaMain.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in the <#1023740163857338478> channel!`
            );
            karutaDrop.send(
                `:shinto_shrine: **Need help with Karuta?** Ask in the <#1023740163857338478> channel!`
            );
            sofiDrop.send(
                `:shinto_shrine: **Need help with Sofi?** Ask in the <#1023740163857338478> channel!`
            );
            tofuSummon.send(
                `:shinto_shrine: **Need help with Tofu?** Ask in the <#1023740163857338478> channel!`
            );
            gachaponDrop.send(
                `:shinto_shrine: **Need help with Gachapon?** Ask in the <#1023740163857338478> channel!`
            );
            console.log("[INFO] [autofeed] Sent 'Karuta help' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'Karuta help' reminder:",
                error
            );
        }
    });

    // Karuta wishlist
    cron.schedule("45 * * * *", () => {
        try {
            karutaMain.send(
                `:shinto_shrine: **Set your wishlist watch channel here!** Use command \`kww\`.`
            );
            karutaDrop.send(
                `:shinto_shrine: **Set your wishlist watch channel here!** Use command \`kww\`.`
            );
            console.log("[INFO] [autofeed] Sent 'Karuta wishlist' reminder");
        } catch (error) {
            console.error(
                "[ERROR] [autofeed] Failed to send 'Karuta wishlist' reminder:",
                error
            );
        }
    });
}

module.exports = autofeedInit;
