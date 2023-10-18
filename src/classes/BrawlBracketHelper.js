const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require("discord.js");
const { mergeImages } = require("../functions/editImage");
const { shuffleArray } = require("../functions/shuffleArray");
const { delay } = require("../functions/delay");
const { getWinnerEmbed } = require("../functions/embeds/brawlWinner");
const config = require("../../config.json");
const { client } = require("../index");
const UserStatHelper = require("./UserStatHelper");
const { deleteMany } = require("../data/schemas/userStatSchema");

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
        let count = 1;
        users.forEach(async (reactedUser) => {
            const guild = client.guilds.cache.get(config.guildID);
            const member = guild.members.cache.get(reactedUser.id);

            if (
                member.roles.cache.some(
                    (role) => role.name === "Server Booster"
                )
            ) {
                count += config.serverBoosterBonus;
            } else if (
                member.roles.cache.some(
                    (role) => role.name === "Active Booster"
                )
            ) {
                count += config.activeBoosterBonus;
            } else if (
                member.roles.cache.some(
                    (role) => role.name === "Server Subscriber"
                )
            ) {
                count += config.serverSubscriberBonus;
            }
            await myUserStat.updateVotesGiven(reactedUser.id, count);
        });
        return count;
    }

    async conductMatch(channel, bracketModel, setupModel, myUserStat) {
        const round = bracketModel.currentRound;
        const match = bracketModel.currentMatch;

        // Combine card images
        const image1 = setupModel.cards.get(this.card1).imageLink;
        const image2 = setupModel.cards.get(this.card2).imageLink;
        const imageBuffer = await mergeImages(image1, image2);

        // Vote buttons
        const button1 = new ButtonBuilder()
            .setCustomId("button1")
            .setEmoji("1️⃣")
            .setStyle(ButtonStyle.Success);

        const button2 = new ButtonBuilder()
            .setCustomId("button2")
            .setEmoji("2️⃣")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button1, button2);

        // Display matchup as a png with reactions for the audience to vote
        const message = await channel.send({
            content: `### Round ${round}: Match ${match}`,
            files: [imageBuffer],
            components: [row],
        });

        const collector = await message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
        });

        const user1 = setupModel.cards.get(this.card1).userID;
        const user2 = setupModel.cards.get(this.card2).userID;
        const users1 = new Set();
        const users2 = new Set();

        collector.on("collect", async (i) => {
            await i.deferUpdate();

            // Contestants cannot vote on rounds with their card
            if (i.user === user1 || i.user === user2) {
                i.reply({
                    content: "Your card is in this round. You cannot vote.",
                    ephemeral: true,
                });
            }

            if (i.customId === "button1") {
                if (users2.has(i.user)) {
                    users2.delete(i.user);
                    users1.add(i.user);
                    i.reply({
                        content: "You switched your vote to Card 1!",
                        ephemeral: true,
                    });
                } else {
                    users1.add(i.user);
                    i.reply({
                        content: "You voted for Card 1!",
                        ephemeral: true,
                    });
                }
            }
            if (i.customId === "button2") {
                if (users1.has(i.user)) {
                    users1.delete(i.user);
                    users2.add(i.user);
                    i.reply({
                        content: "You switched your vote to Card 2!",
                        ephemeral: true,
                    });
                } else {
                    users2.add(i.user);
                    i.reply({
                        content: "You voted for Card 2!",
                        ephemeral: true,
                    });
                }
            }
        });

        // End the collector
        collector.on("end", async (i) => {
            await message.edit({
                content: `### Round ${round}: Match ${match}`,
                files: [imageBuffer],
                components: [],
            });
        });

        let count1 = users1.size;
        let count2 = users2.size;

        // Bonus votes
        const bonus1 = await this.addBonusVotes(users1, myUserStat);
        const bonus2 = await this.addBonusVotes(users2, myUserStat);
        count1 += bonus1;
        count2 += bonus2;

        // Update honorable mentions
        if (count1 < bracketModel.leastVotes[0]) {
            bracketModel.leastVotes = [count1, this.card1];
        }
        if (count1 > bracketModel.mostVotes[0]) {
            bracketModel.mostVotes = [count1, this.card1];
        }
        if (count2 < bracketModel.leastVotes[0]) {
            bracketModel.leastVotes = [count2, this.card2];
        }
        if (count2 > bracketModel.mostVotes[0]) {
            bracketModel.mostVotes = [count2, this.card2];
        }

        // Update user stats
        await myUserStat.updateVotesReceived(user1, count1);
        await myUserStat.updateVotesReceived(user2, count2);

        const difference = Math.abs(count1 - count2);
        if (count1 > count2) {
            this.winner = this.card1;
            if (difference === 1) {
                await channel.send(
                    `**Card 1** won by just **1** vote, with ${bonus1} bonus! [**${count1}**:**${count2}**]`
                );
            } else {
                await channel.send(
                    `**Card 1** won by **${difference}** votes, with ${bonus1} bonus! [**${count1}**:**${count2}**]`
                );
            }
            await myUserStat.updateMatchesCompeted(user1, true, false);
            await myUserStat.updateMatchesCompeted(user2, false, false);
        } else if (count1 < count2) {
            this.winner = this.card2;
            if (difference === 1) {
                await channel.send(
                    `**Card 2** won by just **1** vote, with ${bonus2} bonus! [**${count1}**:**${count2}**]`
                );
            } else {
                await channel.send(
                    `**Card 2** won by **${difference}** votes, with ${bonus2} bonus! [**${count1}**:**${count2}**]`
                );
            }
            await myUserStat.updateMatchesCompeted(user1, false, false);
            await myUserStat.updateMatchesCompeted(user2, true, false);
        } else {
            this.winner = Math.random() < 0.5 ? this.card1 : this.card2;
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
                    await delay(2);
                    if (this.winner === this.card1) {
                        msg.edit(
                            `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... **Card 1**! 🎉`
                        );
                        await myUserStat.updateMatchesCompeted(
                            user1,
                            true,
                            true
                        );
                        await myUserStat.updateMatchesCompeted(
                            user2,
                            false,
                            true
                        );
                    } else {
                        msg.edit(
                            `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... **Card 2**! 🎉`
                        );
                        await myUserStat.updateMatchesCompeted(
                            user1,
                            false,
                            true
                        );
                        await myUserStat.updateMatchesCompeted(
                            user2,
                            true,
                            true
                        );
                    }
                });
        }
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
                this.bracketModel,
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
        await this.announceMentions();
        await this.announceWinner();

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

    async announceMentions() {
        await this.channel.send("# Honorable Mentions");
        await delay(2);

        const leastInfo = this.bracketModel.leastVotes;
        const leastID = this.setupModel.cards.get(leastInfo[1]).userID;
        const leastImage = this.setupModel.cards.get(leastInfo[1]).imageLink;
        const leastEmbed = new EmbedBuilder()
            .setTitle("Least Votes")
            .setDescription(
                `Received the least votes out of all the matches: **${leastInfo[0]}**.\nCard: \`${leastInfo[1]}\` by <@${leastID}>`
            )
            .setImage(leastImage);
        await this.channel.send({
            embeds: [leastEmbed],
        });
        await this.myUserStat.updateMentions(leastID);
        await delay(2);

        const mostInfo = this.bracketModel.mostVotes;
        const mostID = this.setupModel.cards.get(mostInfo[1]).userID;
        const mostImage = this.setupModel.cards.get(mostInfo[1]).imageLink;
        const mostEmbed = new EmbedBuilder()
            .setTitle("Most Votes")
            .setDescription(
                `Received the most votes out of all the matches: **${mostInfo[0]}**.\nCard: \`${mostInfo[1]}\` by <@${mostID}>`
            )
            .setImage(mostImage);
        await this.channel.send({
            embeds: [mostEmbed],
        });
        await this.myUserStat.updateMentions(mostID);
        await delay(2);
    }

    async announceWinner() {
        if (
            this.bracketModel.completedMatches.length ===
            this.bracketModel.competitors.length - 1
        ) {
            const winnerCard =
                this.bracketModel.completedMatches[
                    this.bracketModel.completedMatches.length - 1
                ].winner;
            const winnerID = this.setupModel.cards.get(winnerCard).userID;

            // Update user stats for win
            await this.myUserStat.updateWin(winnerID);

            await this.channel.send({
                content: `# Winner! 🎉\nCongratulations, <@${winnerID}> is the <@&${config.brawlChampionRole}>!`,
                embeds: [getWinnerEmbed(this.bracketModel, this.setupModel)],
                allowedMentions: { parse: [] },
            });

            // Edit announcement message with image of winning card
            const competitorsChannel = client.channels.cache.get(
                config.competitorsChannelID
            );
            competitorsChannel.messages
                .fetch(this.setupModel.messageID)
                .then((message) => {
                    const updatedEmbed = new EmbedBuilder(message.embeds[0]);
                    updatedEmbed.setImage(
                        this.setupModel.cards.get(winnerCard).imageLink
                    );
                    updatedEmbed.setFooter({
                        text: "This Card Brawl has a winner!",
                    });
                    message.edit({
                        content: `The \`${this.setupModel.name}\` Card Brawl has a winner! 🥊 <@&${config.competitorRole}>`,
                        embeds: [updatedEmbed],
                    });
                });

            // Give winner Brawl Champion role
            const guild = client.guilds.cache.get(config.guildID);
            const member = guild.members.cache.get(winnerID);
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
