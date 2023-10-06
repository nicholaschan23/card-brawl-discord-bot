const { EmbedBuilder } = require("discord.js");
const { mergeImages } = require("../functions/mergeImages");
const { shuffleArray } = require("../functions/shuffleArray");
const { delay } = require("../functions/delay");
const { getWinnerEmbed } = require("../functions/embeds/brawlWinner")
const config = require("../../config.json");
const { client } = require("../index");
const UserStatHelper = require("./UserStatHelper");

class Match {
    /**
     * @param {String} cardCode
     * @param {String} cardCode
     */
    constructor(matchSchema) {
        this.card1 = matchSchema.card1;
        this.card2 = matchSchema.card2;
        this.winner = null;
    }

    addBonusVotes(users, myUserStat) {
        let count = 0;
        users.forEach(async (reactedUser) => {
            const guild = client.guilds.cache.get(config.guildID);
            const member = guild.members.cache.get(reactedUser.id);

            if (reactedUser.id != config.clientID) {
                let userCount = 0;
                if (
                    member.roles.cache.some(
                        (role) => role.name === "Server Booster"
                    )
                ) {
                    userCount++;
                    if (
                        member.roles.cache.some(
                            (role) => role.name === "Active Booster"
                        )
                    ) {
                        userCount += 3;
                    }
                }
                if (
                    member.roles.cache.some(
                        (role) => role.name === "Server Subscriber"
                    )
                ) {
                    userCount += 5;
                }
                count += userCount;
                await myUserStat.updateVotesGiven(reactedUser.id, userCount + 1);
            }
        });
        return count;
    }

    async conductMatch(channel, round, match, setupModel, myUserStat) {
        // Combine card images
        const image1 = setupModel.cards.get(this.card1).imageLink;
        const image2 = setupModel.cards.get(this.card2).imageLink;
        const imageBuffer = await mergeImages(image1, image2);

        // Display matchup as a png with reactions for the audience to vote
        const message = await channel.send({
            content: `### Round ${round}: Match ${match}`,
            files: [imageBuffer],
        });
        await message.react("1️⃣");
        await message.react("2️⃣");

        // Voting time
        await delay(config.voteTime);

        // Get the count of users who reacted with the specified emoji.
        const reaction1 = await message.reactions.cache.find(
            (reaction) => reaction.emoji.name === "1️⃣"
        );
        const reaction2 = await message.reactions.cache.find(
            (reaction) => reaction.emoji.name === "2️⃣"
        );
        const users1 = await reaction1.users.fetch();
        const users2 = await reaction2.users.fetch();
        let count1 = (await reaction1.count) - 1;
        let count2 = (await reaction2.count) - 1;

        // Bonus votes
        const bonus1 = await this.addBonusVotes(users1, myUserStat);
        // if (bonus1 === 0) {
        //     await channel.send("No bonus votes for Card 1...");
        // } else {
        //     await channel.send("Adding bonus votes for Card 1!");
        // }
        // await delay(2);
        const bonus2 = await this.addBonusVotes(users2, myUserStat);
        // if (bonus2 === 0) {
        //     await channel.send("No bonus votes for Card 2...");
        // } else {
        //     await channel.send("Adding bonus votes for Card 2!");
        // }
        // await delay(2);
        count1 += bonus1;
        count2 += bonus2;

        // Update user stats
        const user1 = setupModel.cards.get(this.card1).userID;
        const user2 = setupModel.cards.get(this.card2).userID;
        await myUserStat.updateVotesReceived(user1, count1);
        await myUserStat.updateVotesReceived(user2, count2);

        const difference = Math.abs(count1 - count2);
        if (count1 > count2) {
            this.winner = this.card1;
            if (difference === 1) {
                await channel.send(
                    `**Card 1** won by just **1** vote! [**${count1}**:**${count2}**]`
                );
            } else {
                await channel.send(
                    `**Card 1** won by **${difference}** votes! [**${count1}**:**${count2}**]`
                );
            }
            await myUserStat.updateMatchesCompeted(user1, true, false);
            await myUserStat.updateMatchesCompeted(user2, false, false);
        } else if (count1 < count2) {
            this.winner = this.card2;
            if (difference === 1) {
                await channel.send(
                    `**Card 2** won by just **1** vote! [**${count1}**:**${count2}**]`
                );
            } else {
                await channel.send(
                    `**Card 2** won by **${difference}** votes! [**${count1}**:**${count2}**]`
                );
            }
            await myUserStat.updateMatchesCompeted(user1, false, false);
            await myUserStat.updateMatchesCompeted(user2, true, false);
        } else {
            this.winner = Math.random() < 0.5 ? this.card1 : this.card2;
            // TODO: Add player stat for ties won
            await channel
                .send(
                    `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... 🥁`
                )
                .then(async (msg) => {
                    await delay(1); // Suspense
                    msg.edit(
                        `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... 🥁 🥁`
                    );
                    await delay(1);
                    msg.edit(
                        `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... 🥁 🥁 🥁`
                    );
                    await delay(3);
                    if (this.winner === this.card1) {
                        msg.edit(
                            `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... **Card 1**! 🎉`
                        );
                        await myUserStat.updateMatchesCompeted(user1, true, true);
                        await myUserStat.updateMatchesCompeted(user2, false, true);
                    } else {
                        msg.edit(
                            `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... **Card 2**! 🎉`
                        );
                        await myUserStat.updateMatchesCompeted(user1, false, true);
                        await myUserStat.updateMatchesCompeted(user2, true, true);
                    }
                });
        }

        // TODO: Update player stats

        // Return completed match
        const completedMatchSchema = {
            card1: this.card1,
            card2: this.card2,
            winner: this.winner,
        };
        return completedMatchSchema;
    }
}

class BrawlBracketHelper {
    constructor(channel, bracketModel, setupModel) {
        this.channel = channel;
        this.bracketModel = bracketModel;
        this.setupModel = setupModel;
        this.myUserStat = new UserStatHelper();
    }

    getStatus() {
        if (this.bracketModel.matches.length === 0) {
            if (this.bracketModel.completedMatches.length === 0) return 0; // Brawl has not started
            if (
                this.bracketModel.completedMatches.length ===
                this.bracketModel.competitors.length - 1
            )
                return 2; // Brawl is finished
        }
        return 1; // Brawl is in progress
    }

    // Split competitors into pairs to create initial matches
    // Run this once before conduct tournament method
    generateInitialBracket() {
        // Randomize competitors
        this.bracketModel.competitors = shuffleArray(
            this.bracketModel.competitors
        );

        // Assign round 1
        for (let i = 0; i < this.bracketModel.competitors.length; i += 2) {
            const matchSchema = {
                card1: this.bracketModel.competitors[i],
                card2: this.bracketModel.competitors[i + 1],
                winner: null,
            };
            this.bracketModel.matches.push(matchSchema);
        }
        this.saveProgress();
    }

    // Conduct the tournament
    async conductTournament() {
        const totalRounds = Math.log2(this.setupModel.size);
        while (this.bracketModel.matches.length > 0) {
            // Finals announcements
            if (this.bracketModel.currentMatch === 1) {
                switch (this.bracketModel.currentRound) {
                    case totalRounds - 2: {
                        await this.channel.send("## Quarter-finals");
                        break;
                    }
                    case totalRounds - 1: {
                        await this.channel.send("## Semi-finals");
                        break;
                    }
                    case totalRounds: {
                        await this.channel.send("## Finals");
                        break;
                    }
                }
            }

            const currentMatch = new Match(this.bracketModel.matches.shift());
            const completedMatchSchema = await currentMatch.conductMatch(
                this.channel,
                this.bracketModel.currentRound,
                this.bracketModel.currentMatch,
                this.setupModel,
                this.myUserStat
            ); // Determine the winner of the match

            // Save the match result and update the bracket
            await this.bracketModel.completedMatches.push(completedMatchSchema);

            // Check if there are more matches in the current round
            // If not, move to the next round
            if (this.bracketModel.matches.length === 0) {
                this.bracketModel.currentRound++;
                this.bracketModel.currentMatch = 1;
                await this.generateNextRound();
            } else {
                this.bracketModel.currentMatch++;
            }
            this.saveProgress(); // Save after every completed match
            this.myUserStat.saveProgress();
            await delay(2);
        }
        this.announceWinner();

        // Update user stats completed Card Brawl
        const userIDs = [];
        this.setupModel.cards.forEach((card) => {
            userIDs.push(card.userID);
        });
        await this.myUserStat.updateCardsEntered(userIDs);
        this.myUserStat.saveProgress();
    }

    // Generate matches for the next round based on the winners of the current round
    generateNextRound() {
        // Bracket finished
        if (
            this.bracketModel.completedMatches.length ===
            this.bracketModel.competitors.length - 1
        ) {
            // Update user stats for win
            return;
        }

        // Generate next round matches
        for (
            let i = this.bracketModel.startIndex;
            i < this.bracketModel.completedMatches.length;
            i += 2
        ) {
            const matchSchema = {
                card1: this.bracketModel.completedMatches[i].winner,
                card2: this.bracketModel.completedMatches[i + 1].winner,
                winner: null,
            };
            this.bracketModel.matches.push(matchSchema);
        }
        this.bracketModel.startIndex =
            this.bracketModel.completedMatches.length;
    }

    async announceWinner() {
        if (
            this.bracketModel.completedMatches.length ===
            this.bracketModel.competitors.length - 1
        ) {
            await this.channel.send({
                content: "# Congratulations! 🎉",
                embeds: [getWinnerEmbed(this.bracketModel, this.setupModel)],
            });

            // Edit announcement message with image of winning card
            const announcementChannel = client.channels.cache.get(
                config.announcementChannelID
            );
            announcementChannel.messages
                .fetch(this.setupModel.messageID)
                .then((message) => {
                    const updatedEmbed = new EmbedBuilder(message.embeds[0]);
                    updatedEmbed.setImage(
                        this.setupModel.cards.get(winner).imageLink
                    );
                    updatedEmbed.setFooter({
                        text: "This Card Brawl has a winner!",
                    });
                    message.edit({ 
                        content: `The \`${this.setupModel.name}\` Card Brawl has a winner! 🥊 <@&${config.competitorRole}>`,
                        embeds: [updatedEmbed] });
                });

            // Give winner Brawl Champion role
            const guild = client.guilds.cache.get(config.guildID);
            const member = guild.members.cache.get(
                this.setupModel.cards.get(winner).userID
            );
            const role = guild.roles.cache.find(
                (r) => r.name === "Brawl Champion"
            );
            member.roles.add(role);
        }
    }

    // Save the tournament progress to database
    async saveProgress() {
        await this.bracketModel.save();
    }
}

module.exports = BrawlBracketHelper;
