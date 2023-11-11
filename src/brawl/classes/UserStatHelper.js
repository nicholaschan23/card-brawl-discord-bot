const UserStatModel = require("../schemas/userStatSchema");
const client = require("../../index");

class UserStatHelper {
    constructor() {
        this.userStatModels = {};
    }

    async getUserStatModel(userID) {
        try {
            // Check if name already exists in dictionary
            let statModel = this.userStatModels[userID];
            if (!statModel) {
                statModel = await UserStatModel.findOne({ userID }).exec();

                // User stats doesn't exist, create one
                if (!statModel) {
                    statModel = new UserStatModel({
                        userID: userID,
                    });
                }
                this.userStatModels[userID] = statModel;
            }
            return statModel;
        } catch (error) {
            console.error("[USER STAT] Error retrieving UserStatModel:", error);
            return;
        }
    }

    // cardsEntered
    async updateCardsEntered(userIDs) {
        const task = async () => {
            userIDs.forEach(async (userID) => {
                const statModel = await this.getUserStatModel(userID);
                if (statModel) {
                    statModel.cardsEntered++;
                } else {
                    console.error("Failed to update cards entered");
                }
            });
        };
        await client.userStatQueue.enqueue(task);
    }

    // matchesCompeted
    // matchesWon
    // tiesLost
    // tiesWon
    async updateMatchesCompeted(userID, win, tie) {
        const task = async () => {
            const statModel = await this.getUserStatModel(userID);
            if (statModel) {
                if (win) {
                    statModel.matchesWon++;
                    if (tie) {
                        statModel.tiesWon++;
                    }
                } else if (tie) {
                    statModel.tiesLost++;
                }
                statModel.matchesCompeted++;
            } else {
                console.error("Failed to update matches completed");
            }
        };
        await client.userStatQueue.enqueue(task);
    }

    // honorableMentions
    async updateMentions(userID) {
        const task = async () => {
            const statModel = await this.getUserStatModel(userID);
            if (statModel) {
                statModel.honorableMentions++;
            } else {
                console.error("Failed to update honorable mentions");
            }
        };
        await client.userStatQueue.enqueue(task);
    }

    // wins
    async updateWin(userID) {
        const task = async () => {
            const statModel = await this.getUserStatModel(userID);
            if (statModel) {
                statModel.wins++;
            } else {
                console.error("Failed to update wins");
            }
        };
        await client.userStatQueue.enqueue(task);
    }

    // matchesJudged
    // votesGiven
    async updateVotesGiven(userID, votes) {
        const task = async () => {
            const statModel = await this.getUserStatModel(userID);
            if (statModel) {
                statModel.matchesJudged++;
                statModel.votesGiven += votes;
            } else {
                console.error("Failed to update votes given");
            }
        };
        await client.userStatQueue.enqueue(task);
    }

    // votesReceived
    // votesHighest
    async updateVotesReceived(userID, votes) {
        const task = async () => {
            const statModel = await this.getUserStatModel(userID);
            if (statModel) {
                statModel.votesReceived += votes;
                if (votes > statModel.votesHighest) {
                    statModel.votesHighest += votes;
                }
            } else {
                console.error("Failed to update votes received");
            }
        };
        await client.userStatQueue.enqueue(task);
    }

    // Save the user stats progress to persistent storage
    async saveProgress() {
        const task = async () => {
            for (const model of Object.values(this.userStatModels)) {
                await model.save();
            }
        };
        await client.userStatQueue.enqueue(task);
    }
}

module.exports = UserStatHelper;
