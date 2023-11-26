const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
} = require("discord.js");
const getWinnerEmbed = require("../embeds/brawlWinner");
const mergeImages = require("../src/meregeImages");
const shuffleArray = require("../src/shuffleArray");
const delay = require("../src/delay");
const client = require("../../index");
const bconfig = require("../brawl-config.json");
const config = require("../../../config.json");
const UserStatHelper = require("./UserStatHelper");
const { deleteMany } = require("../schemas/userStatSchema");

class Match {
    /**
     * @param {String} cardCode
     * @param {String} cardCode
     */
    constructor(matchSchema) {
        this.card1 = matchSchema.card1;
        this.card2 = matchSchema.card2;
        this.winner = matchSchema.winner;
    }

    async addBonusVotes(userIDs, myUserStat) {
        const guild = client.guilds.cache.get(config.guildID);

        let totalCount = 0;

        for (const reactedUser of userIDs) {
            let bonus = 0;
            const member = await guild.members.fetch(reactedUser);

            if (member.roles.cache.some((role) => role.name === "Owner")) {
                bonus = 1;
            } else if (
                member.roles.cache.some(
                    (role) => role.name === "Active Booster" || role.name === "Server Subscriber"
                )
            ) {
                bonus = Math.max(bconfig.activeBoosterBonus, bconfig.serverSubscriberBonus);
            }
            totalCount += bonus;

            myUserStat.updateVotesGiven(reactedUser, 1);
        }

        return totalCount;
    }

    async conductMatch(channel, bracketModel, setupModel, myUserStat) {
        const round = bracketModel.currentRound;
        const match = bracketModel.currentMatch;

        // Free match
        if (this.winner !== null) {
            console.log(`[BRAWL BRACKET] Round ${round}: Match ${match} already has winner`);
            const completedMatchSchema = {
                card1: null,
                card2: null,
                winner: this.winner,
            };
            return completedMatchSchema;
        }
        console.log(`[BRAWL BRACKET] Round ${round}: Match ${match} conducting match...`);

        // Combine card images
        const image1 = setupModel.cards.get(this.card1).imageLink;
        const image2 = setupModel.cards.get(this.card2).imageLink;
        const imageBuffer = await mergeImages(image1, image2);

        // Vote buttons
        const button1 = new ButtonBuilder()
            .setCustomId("button1")
            .setEmoji("1️⃣")
            .setStyle(ButtonStyle.Primary);
        const button2 = new ButtonBuilder()
            .setCustomId("button2")
            .setEmoji("2️⃣")
            .setStyle(ButtonStyle.Primary);
        const buttonTotal = new ButtonBuilder()
            .setCustomId("buttonTotal")
            .setLabel("0 Voters")
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(button1, button2, buttonTotal);

        // Display matchup as a png with reactions for the audience to vote
        const message = await channel.send({
            content: `### Round ${round}: Match ${match}`,
            files: [imageBuffer],
            components: [row],
        });

        const owner1 = setupModel.cards.get(this.card1).userID;
        const owner2 = setupModel.cards.get(this.card2).userID;
        const users1 = new Set();
        const users2 = new Set();
        const interacted = new Set();

        // Button listeners
        const collector = await message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: bconfig.voteTime * 1000,
        });

        // Collect responses
        collector.on("collect", async (interaction) => {
            try {
                await interaction.deferUpdate();

                // Dead button
                if (interaction.customId === "totalVotes") {
                    return;
                }

                // Replies only once
                const userID = interaction.user.id;
                if (interacted.has(userID)) {
                    return;
                }
                interacted.add(userID);

                // Contestants cannot vote on rounds with their card
                if (userID === owner1 || userID === owner2) {
                    return await interaction.followUp({
                        content: "Your card is in this round. You cannot vote.",
                        ephemeral: true,
                    });
                }

                if (interaction.customId === "button1") {
                    users1.add(userID);
                    await interaction.followUp({
                        content: "You voted for Card 1!",
                        ephemeral: true,
                    });
                } else if (interaction.customId === "button2") {
                    users2.add(userID);
                    await interaction.followUp({
                        content: "You voted for Card 2!",
                        ephemeral: true,
                    });
                }

                // Update total votes label
                buttonTotal.setLabel(`${interacted.size} Voters`);
                await message.edit({
                    components: [row],
                });
            } catch (error) {
                console.error("Button interaction failed voting for a card:", error);
            }
        });

        // End the collector
        collector.on("end", async () => {
            button1.setDisabled(true);
            button2.setDisabled(true);
            buttonTotal.setDisabled(true);
            await message.edit({
                components: [row],
            });
        });
        await delay(bconfig.voteTime);

        // Count votes
        let count1 = users1.size;
        let count2 = users2.size;

        // Update user stats
        myUserStat.updateVotesReceived(owner1, count1);
        myUserStat.updateVotesReceived(owner2, count2);

        // Bonus votes
        let bonus1 = 0;
        let bonus2 = 0;
        try {
            bonus1 = await this.addBonusVotes(users1, myUserStat);
            bonus2 = await this.addBonusVotes(users2, myUserStat);
        } catch (error) {
            console.error("Failed to calculate bonus votes:", error);
        }
        count1 += bonus1;
        count2 += bonus2;

        // Update honorable mentions
        if (count1 < bracketModel.leastVotes.count) {
            bracketModel.leastVotes.count = count1;
            bracketModel.leastVotes.card = this.card1;
        }
        if (count1 > bracketModel.mostVotes.count) {
            bracketModel.mostVotes.count = count1;
            bracketModel.mostVotes.card = this.card1;
        }
        if (count2 < bracketModel.leastVotes.count) {
            bracketModel.leastVotes.count = count2;
            bracketModel.leastVotes.card = this.card2;
        }
        if (count2 > bracketModel.mostVotes.count) {
            bracketModel.mostVotes.count = count2;
            bracketModel.mostVotes.card = this.card2;
        }

        // Announce match winner
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
            myUserStat.updateMatchesCompeted(owner1, true, false);
            myUserStat.updateMatchesCompeted(owner2, false, false);
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
            myUserStat.updateMatchesCompeted(owner1, false, false);
            myUserStat.updateMatchesCompeted(owner2, true, false);
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
                        myUserStat.updateMatchesCompeted(owner1, true, true);
                        myUserStat.updateMatchesCompeted(owner2, false, true);
                    } else {
                        msg.edit(
                            `Voting ended in a **tie** with **${count1}** votes each. The lucky winner is... **Card 2**! 🎉`
                        );
                        myUserStat.updateMatchesCompeted(owner1, false, true);
                        myUserStat.updateMatchesCompeted(owner2, true, true);
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
    constructor(bracketModel, setupModel) {
        this.bracketModel = bracketModel;
        this.setupModel = setupModel;

        this.idealSize = Math.pow(2, Math.ceil(Math.log2(this.setupModel.cards.size)));
        this.channel = client.channels.cache.get(config.judgesChannelID);
        this.myUserStat = new UserStatHelper();
    }

    getStatus() {
        if (this.bracketModel.matches.length === 0) {
            if (this.bracketModel.completedMatches.length === 0) return 0; // Brawl has not started
            if (this.bracketModel.completedMatches.length === this.idealSize - 1) return 2; // Brawl is finished
        }
        return 1; // Brawl is in progress
    }

    // Split competitors into pairs to create initial matches
    // Run this once before conduct tournament method
    generateInitialBracket() {
        // Randomize competitors
        this.bracketModel.competitors = shuffleArray(this.bracketModel.competitors);

        // Calculate error
        const competitorsSize = this.bracketModel.competitors.length;
        const diff = this.idealSize - competitorsSize;
        console.log(
            `[BRAWL BRACKET] ${diff} free pass matches + ${
                competitorsSize - diff
            } normal matches = ${competitorsSize} total competitors`
        );

        let i = 0;
        // Free passes
        for (; i < diff; i++) {
            const matchSchema = {
                card1: null,
                card2: null,
                winner: this.bracketModel.competitors[i],
            };
            this.bracketModel.matches.push(matchSchema);
        }
        // Normal matchmaking
        for (; i < competitorsSize; i += 2) {
            const matchSchema = {
                card1: this.bracketModel.competitors[i],
                card2: this.bracketModel.competitors[i + 1],
                winner: null,
            };
            this.bracketModel.matches.push(matchSchema);
        }
        console.log("[BRAWL BRACKET] Generated initial bracket");
    }

    // Conduct the tournament
    async conductTournament() {
        const totalRounds = Math.log2(this.idealSize);

        while (this.bracketModel.completedMatches.length !== this.idealSize - 1) {
            // Check if there are more matches in the current round
            if (this.bracketModel.matches.length === 0) {
                this.bracketModel.currentRound++;
                this.bracketModel.currentMatch = 1;
                await this.generateNextRound();
            }

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

            // Determine the winner of the match
            const currentMatch = new Match(this.bracketModel.matches.shift());
            const completedMatchSchema = await currentMatch.conductMatch(
                this.channel,
                this.bracketModel,
                this.setupModel,
                this.myUserStat
            );
            // Save the match result and update the bracket
            this.bracketModel.completedMatches.push(completedMatchSchema);
            this.bracketModel.currentMatch++;

            // Save progress and stats after every completed match
            if (completedMatchSchema.card1 !== null) {
                console.log("[BRAWL BRACKET] Saving progress and user stats");
                await this.saveProgress();
                await this.myUserStat.saveProgress();
            }
        }

        // Card Brawl finished
        await this.announceMentions();
        await this.announceWinner();

        // Update user stats completed Card Brawl
        const userIDs = [];
        this.setupModel.cards.forEach((card) => {
            userIDs.push(card.userID);
        });
        this.myUserStat.updateCardsEntered(userIDs);
        await this.myUserStat.saveProgress();
    }

    // Generate matches for the next round based on the winners of the current round
    generateNextRound() {
        // Bracket finished
        if (this.bracketModel.completedMatches.length === this.idealSize - 1) {
            return;
        }

        // Generate next round matches
        for (
            let i = this.bracketModel.startIndex;
            i < this.bracketModel.completedMatches.length;
            i += 2
        ) {
            console.log(`[BRAWL BRACKET] Creating match ${i} with ${i + 1}`);
            const matchSchema = {
                card1: this.bracketModel.completedMatches[i].winner,
                card2: this.bracketModel.completedMatches[i + 1].winner,
                winner: null,
            };
            this.bracketModel.matches.push(matchSchema);
        }
        this.bracketModel.startIndex = this.bracketModel.completedMatches.length;
    }

    // Honorable mentions
    async announceMentions() {
        await this.channel.send("# Honorable Mentions");
        await delay(2);

        // Least votes embed
        const leastVotes = this.bracketModel.leastVotes;
        const leastID = this.setupModel.cards.get(leastVotes.card).userID;
        const leastImage = this.setupModel.cards.get(leastVotes.card).imageLink;
        const leastEmbed = new EmbedBuilder()
            .setTitle("Least Votes")
            .setDescription(
                `Votes: **${leastVotes.count}**\nCard: \`${leastVotes.card}\` by <@${leastID}>`
            )
            .setImage(leastImage);
        await this.channel.send({
            embeds: [leastEmbed],
        });
        this.myUserStat.updateMentions(leastID);
        await delay(2);

        // Most votes embed
        const mostVotes = this.bracketModel.mostVotes;
        const mostID = this.setupModel.cards.get(mostVotes.card).userID;
        const mostImage = this.setupModel.cards.get(mostVotes.card).imageLink;
        const mostEmbed = new EmbedBuilder()
            .setTitle("Most Votes")
            .setDescription(
                `Votes: **${mostVotes.count}**\nCard: \`${mostVotes.card}\` by <@${mostID}>`
            )
            .setImage(mostImage);
        await this.channel.send({
            embeds: [mostEmbed],
        });
        this.myUserStat.updateMentions(mostID);
        await delay(2);
    }

    async announceWinner() {
        const finalsMatch =
            this.bracketModel.completedMatches[this.bracketModel.completedMatches.length - 1];
        const winnerCard = finalsMatch.winner;
        const winnerID = this.setupModel.cards.get(winnerCard).userID;

        const secondCard = finalsMatch.card1 === winnerCard ? finalsMatch.card2 : finalsMatch.card1;
        const secondID = this.setupModel.cards.get(secondCard).userID;

        const semisMatch =
            this.bracketModel.completedMatches[this.bracketModel.completedMatches.length - 2]
                .winner === winnerCard
                ? this.bracketModel.completedMatches[this.bracketModel.completedMatches.length - 3]
                : this.bracketModel.completedMatches[this.bracketModel.completedMatches.length - 2];
        const thirdCard = semisMatch.card1 === winnerCard ? semisMatch.card2 : semisMatch.card1;
        const thirdID = this.setupModel.cards.get(thirdCard).userID;

        // 3rd place
        const thirdImage = this.setupModel.cards.get(thirdCard).imageLink;
        const thirdEmbed = new EmbedBuilder()
            .setTitle("Third Place")
            .setDescription(
                `Card: \`${thirdCard}\` by <@${thirdID}>`
            )
            .setImage(thirdImage);
        await this.channel.send({
            embeds: [thirdEmbed],
        });
        await delay(2);

        // 2nd place
        const secondImage = this.setupModel.cards.get(thirdCard).imageLink;
        const secondEmbed = new EmbedBuilder()
            .setTitle("Second Place")
            .setDescription(
                `\nCard: \`${secondCard}\` by <@${secondID}>`
            )
            .setImage(secondImage);
        await this.channel.send({
            embeds: [secondEmbed],
        });
        await delay(2);

        // Update user stats for win
        this.myUserStat.updateWin(winnerID);

        // Send winner embed
        await this.channel.send({
            content: `# Winner! 🎉\nCongratulations, <@${winnerID}> is the <@&${config.brawlChampionRole}>!`,
            embeds: [getWinnerEmbed(this.bracketModel, this.setupModel)],
            allowedMentions: { parse: [] },
        });

        // Edit announcement message with image of winning card
        const competitorsChannel = client.channels.cache.get(config.competitorsChannelID);
        competitorsChannel.messages.fetch(this.setupModel.messageID).then((message) => {
            const updatedEmbed = new EmbedBuilder(message.embeds[0]);
            updatedEmbed.setColor(config.yellow);
            updatedEmbed.setImage(this.setupModel.cards.get(winnerCard).imageLink);
            updatedEmbed.setFooter({
                text: "This Card Brawl has a winner!",
            });
            message.edit({
                content: `The \`${this.setupModel.name}\` Card Brawl has a winner! 🥊 <@&${config.competitorRole}>`,
                embeds: [updatedEmbed],
            });
        });

        // Give winner Brawl Champion role
        try {
            const guild = client.guilds.cache.get(config.guildID);
            const member = await guild.members.fetch(winnerID);
            const role = guild.roles.cache.find((r) => r.name === "Brawl Champion");
            if (member) {
                member.roles.add(role);
            } else {
                console.warn("[BRAWL BRACKET] User not found to give Brawl Champion role");
            }
        } catch (error) {
            console.error("[BRAWL BRACKET] Error giving Brawl Champion role:", error);
        }
    }

    // Save the tournament progress to database
    async saveProgress() {
        const task = async () => {
            await this.bracketModel.save();
        };
        await client.bracketModelQueue.enqueue(task);
    }
}

module.exports = BrawlBracketHelper;
