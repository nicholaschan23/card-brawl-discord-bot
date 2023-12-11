const { Events } = require("discord.js");
const UserInventoryModel = require("../schemas/userInventorySchema");
const { client, config } = require("../../index");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Karuta bot message
        if (message.author.bot && message.author.id === config.botID.karuta) {
            // Wishlist drop ping
            if (
                message.content.includes("A card from your wishlist is dropping") ||
                message.content.includes("A wishlisted card is dropping")
            ) {
                console.log("[INFO] [readMessages] Wishlist card dropped");
                message.channel.send(
                    `<@&${config.roleID.wishlistDrop}> A wishlisted card is dropping!`
                );
                return;
            }

            // Check for event drops on server and user drops
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

                    // Event drop ping
                    collector.on("collect", (reaction) => {
                        message.reply(
                            `<@&${config.roleID.eventDrop}> A ${reaction.emoji.name} has dropped!`
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
                const starflight = await guild.members.fetch("816328822051045436");
                // Only server drop pin if other bot is offline
                if (
                    starflight.presence === null ||
                    starflight.presence.status !== "online"
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

                    // Server drop ping
                    if (
                        message.content.includes(
                            "cards since this server is currently active"
                        )
                    ) {
                        console.log("[INFO] [readMessages] Server drop ping");
                        await message.reply(
                            `<@&${config.roleID.serverDrop}> ${numCards} cards are dropping!`
                        );
                    }
                }
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
                            await message.channel.send(
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
