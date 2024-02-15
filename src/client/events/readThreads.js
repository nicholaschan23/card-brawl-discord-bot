const { Events } = require("discord.js");
const client = require("../../index");
const config = require("../../../config.json");

module.exports = {
    name: Events.ThreadCreate,
    async execute(threadChannel) {
        if (
            threadChannel.parentId === config.channelID.tradingAds ||
            threadChannel.parentId === config.channelID.serviceAds
        ) {
            // Owner is exempt
            if (threadChannel.ownerId === config.developerID) {
                return;
            }

            const guild = client.guilds.cache.get(config.guildID);
            const discussionChannel = guild.channels.cache.get(threadChannel.parentId);

            // Fetch all existing threads in the channel
            discussionChannel.threads
                .fetch()
                .then((threadChannelObjects) => {
                    for (const [threadId, thread] of threadChannelObjects.threads) {
                        if (
                            threadChannel.ownerId === thread.ownerId &&
                            threadChannel.createdTimestamp !== thread._createdTimestamp
                        ) {
                            thread.send(
                                `**:x: <@${threadChannel.ownerId}>, your post was deleted because you already opened shop here!** If you want to make a new post, delete this one first.`
                            );
                            threadChannel.delete("Duplicate thread");
                            return;
                        }
                    }
                })
                .catch(console.error);
        }
    },
};
