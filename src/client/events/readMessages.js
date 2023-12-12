const { Events } = require("discord.js");
const UserInventoryModel = require("../../inventory/schemas/userInventorySchema");
const client = require("../../index");
const config = require("../../../config.json");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot && message.author.id === config.botID.karuta) {
            // Karuta wishlist
            if (
                message.content.includes("A card from your wishlist is dropping") ||
                message.content.includes("A wishlisted card is dropping")
            ) {
                console.log("[INFO] [readMessages] Karuta wishlist card dropped");
                message.channel.send(
                    `<@&${config.roleID.karutaWishlist}> A wishlisted card is dropping!`
                );
                return;
            }

            // Check for Karuta event drops on server and user drops
            if (
                message.content.includes("I'm dropping") ||
                message.content.includes("is dropping")
            ) {
                // Emoji filter
                const filter = (reaction, reactingUser) => {
                    return (
                        reactingUser.id === config.botID.karuta &&
                        (reaction.emoji.name === "🍬" ||
                            reaction.emoji.name === "🍫" ||
                            reaction.emoji.name === "🎀" ||
                            reaction.emoji.name === "🥀" ||
                            reaction.emoji.name === "🌻" ||
                            reaction.emoji.name === "🌹" ||
                            reaction.emoji.name === "🌼" ||
                            reaction.emoji.name === "🌷" ||
                            reaction.emoji.name === "💐")
                    );
                };

                // Wait for reaction
                try {
                    const collector = message.createReactionCollector({
                        filter,
                        max: 1,
                        time: 6 * 1000,
                    });

                    collector.on("collect", (reaction) => {
                        message.reply(
                            `<@&${config.roleID.karutaEvent}> A ${reaction.emoji.name} has dropped!`
                        );
                    });

                    collector.on("end", (collected) => {
                        if (collected.size > 0) {
                            console.log(
                                `[INFO] [readMessages] Karuta drop reaction collected`
                            );
                        }
                    });
                } catch (error) {
                    console.error(
                        "[ERROR] [readMessages] Something went wrong with the Karuta drop. Couldn't find reactions",
                        error
                    );
                }

                const guild = client.guilds.cache.get(config.guildID);
                const starflight = await guild.members.fetch(config.botID.starflight);
                // Only server drop ping if other bot is offline
                if (
                    starflight.presence === null ||
                    starflight.presence.status !== "online"
                ) {
                    if (
                        message.content.includes(
                            "cards since this server is currently active"
                        )
                    ) {
                        const regex = /dropping (\d+) cards/; // This regex captures the number after "dropping" and before "cards"
                        const match = message.content.match(regex);
                        if (!match) {
                            console.warn(
                                "[WARN] [readMessages] Couldn't find number of cards dropped"
                            );
                            return;
                        }
                        const numCards = parseInt(match[1], 10);

                        console.log("[INFO] [readMessages] Karuta drop ping");
                        message.reply(
                            `<@&${config.roleID.karutaDrop}> ${numCards} cards are dropping!`
                        );
                        return;
                    }
                }
            }
        }

        if (message.author.bot && message.author.id === config.botID.gachapon) {
            try {
                // Gachapon wishlist
                if (
                    message.content.includes(
                        "A card from your wish list is being dropped!"
                    )
                ) {
                    console.log("[INFO] [readMessages] Gachapon wishlist card dropped");
                    message.channel.send(
                        `<@&${config.roleID.gachaponWishlist}> A wishlisted card is dropping!`
                    );
                    return;
                }

                // Gachapon drop
                if (
                    message.content.includes(`is dropping`) &&
                    message.mentions.users.first().id === config.botID.gachapon
                ) {
                    const regex = /dropping (\d+) cards/;
                    const match = message.content.match(regex);
                    if (!match) {
                        console.warn(
                            "[WARN] [readMessages] Couldn't find number of cards dropped"
                        );
                        return;
                    }
                    const numCards = parseInt(match[1], 10);

                    console.log("[INFO] [readMessages] Gachapon drop ping");
                    message.reply(
                        `<@&${config.roleID.gachaponDrop}> ${numCards} cards are dropping!`
                    );
                }
            } catch (error) {
                console.error(
                    "[ERROR] [readMessages] Failed to send Gachapon drop ping",
                    error
                );
            }
        }

        if (
            message.author.bot &&
            (message.author.id === config.botID.karuta ||
                message.author.id === config.botID.sofi ||
                message.author.id === config.botID.tofu ||
                message.author.id === config.botID.gachapon)
        ) {
            // User dropped cards
            if (
                message.content.includes("is dropping") ||
                message.content.includes("is summoning")
            ) {
                const user = message.mentions.users.first();
                if (!user) {
                    return console.warn(
                        "[WARN] [readMessages] Couldn't find user that dropped cards"
                    );
                }
                if (user.bot) {
                    return;
                }
                const userID = user.id;

                const currentUnixTime = Math.floor(Date.now() / 1000);
                try {
                    const uim = await UserInventoryModel.findOne({ userID }).exec();
                    // Inventory doesn't exist, create one
                    if (!uim) {
                        console.log(`[INFO] [inventory] Inventory created: ${user.tag}`);
                        const model = new UserInventoryModel({
                            userID: userID,
                            lastUnixTime: currentUnixTime,
                            tokenCounter: 1,
                        });
                        await model.save();
                        return;
                    }

                    // Inventory exists, check cooldown
                    if (currentUnixTime >= uim.lastUnixTime + 30 * 60) {
                        uim.tokenCounter++;
                        uim.lastUnixTime = currentUnixTime;
                        console.log(
                            `[INFO] [inventory] Token counter ${uim.tokenCounter}: ${user.tag}`
                        );

                        if (uim.tokenCounter === 5) {
                            console.log(`[INFO] [inventory] Token received: ${user.tag}`);
                            uim.tokenCounter = 0;
                            uim.numTokens++;
                            message.channel.send(
                                `<@${userID}>, you received a ${config.emoji.token} **Token**!`
                            );
                        }

                        const task = async () => {
                            await uim.save();
                        };
                        await client.inventoryQueue.enqueue(task);
                    }
                } catch (error) {
                    console.error("[ERROR] [inventory]", error);
                }
            }
        }
    },
};
