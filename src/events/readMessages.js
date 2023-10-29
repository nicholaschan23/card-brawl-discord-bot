const { Events } = require("discord.js");
const { client } = require("../index");
const config = require("../../config.json");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Karuta bot message
        if (message.author.bot && message.author.id === config.karutaID) {
            // Wishlist drop ping
            if (
                message.content.includes("A card from your wishlist is dropping") ||
                message.content.includes("A wishlisted card is dropping")
            ) {
                console.log("[READ MESSAGES] Wishlist card dropped");
                message.channel.send(
                    `<@&${config.wishlistDropRole}> A wishlisted card is dropping!`
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
                        (reactingUser.id === config.karutaID && reaction.emoji.name === "🍬") ||
                        reaction.emoji.name === "🍫" ||
                        reaction.emoji.name === "🎀" ||
                        reaction.emoji.name === "🥀" ||
                        reaction.emoji.name === "🌻" ||
                        reaction.emoji.name === "🌹" ||
                        reaction.emoji.name === "🌼" ||
                        reaction.emoji.name === "🌷" ||
                        reaction.emoji.name === "💐"
                    );
                };

                // Wait for reaction
                try {
                    const collector = message.createReactionCollector({
                        filter,
                        time: 6 * 1000,
                    });

                    // Event drop ping
                    collector.on("collect", (reaction) => {
                        message.reply(
                            `<@&${config.eventDropRole}> A ${reaction.emoji.name} has dropped!`
                        );
                    });

                    collector.on("end", (collected) => {
                        if (collected.size > 0) {
                            console.log(`[READ MESSAGES] Reaction collected!`);
                        }
                    });
                } catch (error) {
                    console.log(
                        "[READ MESSAGE] Something went wrong with the Karuta drop. Couldn't find reactions",
                        error
                    );
                }

                const guild = client.guilds.cache.get(config.guildID);
                const starflight = await guild.members.fetch("816328822051045436");
                if (starflight.presence.status === null) { // Offline
                    const regex = /dropping (\d+) cards/; // This regex captures the number after "dropping" and before "cards"
                    const match = message.content.match(regex);
                    if (!match) {
                        console.warn("[READ MESSAGES] Couldn't find number of cards dropped");
                        return;
                    }
                    const numCards = parseInt(match[1], 10);

                    // Server drop ping
                    if (message.content.includes("cards since this server is currently active")) {
                        console.log("[READ MESSAGES] Server drop ping");
                        await message.reply(
                            `<@&${config.serverDropRole}> ${numCards} cards are dropping!`
                        );
                    }
                }

                // User dropped cards
                if (message.content.includes("is dropping")) {
                    const user = message.mentions.users.first();
                    if (!user) {
                        return console.warn("[READ MESSAGES] Couldn't find user");
                    }
                    const userID = user.id;
                    console.log(userID);
                }
            }
        }
    },
};
