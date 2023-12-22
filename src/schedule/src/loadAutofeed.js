const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const client = require("../../index");
const config = require("../../../config.json");
const cron = require("node-cron");

function loadAutofeed() {
    const guild = client.guilds.cache.get(config.guildID);
    const karutaMain = client.channels.cache.get(config.channelID.karutaMain);
    const karutaDrop = client.channels.cache.get(config.channelID.karutaDrop);
    const sofiDrop = client.channels.cache.get(config.channelID.sofiDrop);
    const tofuSummon = client.channels.cache.get(config.channelID.tofuSummon);
    const gachaponDrop = client.channels.cache.get(config.channelID.gachaponDrop);

    // Card bot roles
    cron.schedule("0 * * * *", () => {
        try {
            // Karuta
            const karutaDropButton = new ButtonBuilder()
                .setCustomId("toggleKarutaDrop")
                .setLabel("Karuta Drop")
                .setStyle(ButtonStyle.Primary);
            const karutaWishlistButton = new ButtonBuilder()
                .setCustomId("toggleKarutaWishlist")
                .setLabel("Karuta Wishlist")
                .setStyle(ButtonStyle.Primary);
            const karutaEventButton = new ButtonBuilder()
                .setCustomId("toggleKarutaEvent")
                .setLabel("Karuta Event")
                .setStyle(ButtonStyle.Primary);
            const karutaRow = new ActionRowBuilder().addComponents(
                karutaDropButton,
                karutaWishlistButton,
                karutaEventButton
            );
            const karutaContent = `:shinto_shrine: **Want to get notified for <@&${config.roleID.karutaDrop}>, <@&${config.roleID.karutaWishlist}>, or <@&${config.roleID.karutaEvent}>?** Use the buttons below or the command \`/role bot\`!`;
            karutaMain.send({
                content: karutaContent,
                allowedMentions: { parse: [] },
                components: [karutaRow],
            });
            karutaDrop.send({
                content: karutaContent,
                allowedMentions: { parse: [] },
                components: [karutaRow],
            });

            // Sofi
            const sofiWishlistButton = new ButtonBuilder()
                .setCustomId("toggleSofiWishlist")
                .setLabel("Sofi Wishlist")
                .setStyle(ButtonStyle.Primary);
            const sofiRow = new ActionRowBuilder().addComponents(sofiWishlistButton);
            const sofiContent = `:shinto_shrine: **Want to get notified for <@&${config.roleID.sofiWishlist}>?** Use the buttons below or the command \`/role bot\`!`;
            sofiDrop.send({
                content: sofiContent,
                allowedMentions: { parse: [] },
                components: [sofiRow],
            });

            // Tofu
            const tofuDropButton = new ButtonBuilder()
                .setCustomId("toggleTofuDrop")
                .setLabel("Tofu Drop")
                .setStyle(ButtonStyle.Primary);
            const tofuWishlistButton = new ButtonBuilder()
                .setCustomId("toggleTofuWishlist")
                .setLabel("Tofu Wishlist")
                .setStyle(ButtonStyle.Primary);
            const tofuRow = new ActionRowBuilder().addComponents(
                tofuDropButton,
                tofuWishlistButton
            );
            const tofuContent = `:shinto_shrine: **Want to get notified for <@&${config.roleID.tofuDrop}> or <@&${config.roleID.tofuWishlist}>?** Use the buttons below or the command \`/role bot\`!`;
            tofuSummon.send({
                content: tofuContent,
                allowedMentions: { parse: [] },
                components: [tofuRow],
            });

            // Gachapon
            const gachaponDropButton = new ButtonBuilder()
                .setCustomId("toggleGachaponDrop")
                .setLabel("Gachapon Drop")
                .setStyle(ButtonStyle.Primary);
            const gachaponWishlistButton = new ButtonBuilder()
                .setCustomId("toggleGachaponWishlist")
                .setLabel("Gachapon Wishlist")
                .setStyle(ButtonStyle.Primary);
            const gachaponRow = new ActionRowBuilder().addComponents(
                gachaponDropButton,
                gachaponWishlistButton
            );
            const gachaponContent = `:shinto_shrine: **Want to get notified for <@&${config.roleID.gachaponDrop}> or <@&${config.roleID.gachaponWishlist}>?** Use the buttons below or the command \`/role bot\`!`;
            gachaponDrop.send({
                content: gachaponContent,
                allowedMentions: { parse: [] },
                components: [gachaponRow],
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
        let events = await guild.scheduledEvents.fetch();
        events = [...events.values()];
        events.forEach((event) => {
            if (event.name.includes("Card Brawl")) {
                const competitorButton = new ButtonBuilder()
                    .setCustomId("toggleBrawlCompetitor")
                    .setLabel("Brawl Competitor")
                    .setStyle(ButtonStyle.Primary);

                const judgeButton = new ButtonBuilder()
                    .setCustomId("toggleBrawlJudge")
                    .setLabel("Brawl Judge")
                    .setStyle(ButtonStyle.Primary);

                const eventLink = `https://discord.com/events/${config.guildID}/${event.id}`;
                const eventButton = new ButtonBuilder()
                    .setLabel("View Event")
                    .setURL(eventLink)
                    .setStyle(ButtonStyle.Link);

                const competitorsChannel = client.channels.cache.get(
                    config.channelID.brawlCompetitors
                );
                competitorsChannel.messages
                    .fetch({ limit: 1 })
                    .then((messages) => {
                        const latestMessage = messages.first();
                        const messageLink = `https://discord.com/channels/${latestMessage.guild.id}/${latestMessage.channel.id}/${latestMessage.id}`;

                        const enterButton = new ButtonBuilder()
                            .setLabel("Enter Competition")
                            .setURL(messageLink)
                            .setStyle(ButtonStyle.Link);

                        const row = new ActionRowBuilder().addComponents(
                            competitorButton,
                            judgeButton,
                            eventButton,
                            enterButton
                        );

                        const content = `:boxing_glove: **Want to participate in the community __${event.name}__ event this weekend?** Grab the <@&${config.roleID.brawlCompetitor}> and <@&${config.roleID.brawlJudge}> roles to get notification for the event using the buttons below!`;
                        karutaMain.send({
                            content: content,
                            allowedMentions: { parse: [] },
                            components: [row],
                        });
                        karutaDrop.send({
                            content: content,
                            allowedMentions: { parse: [] },
                            components: [row],
                        });
                        console.log(
                            "[INFO] [autofeed] Sent 'Card Brawl promotion' reminder"
                        );
                    })
                    .catch(console.error);
            }
        });
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

module.exports = loadAutofeed;
