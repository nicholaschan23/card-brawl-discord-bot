const UserStatModel = require("../data/schemas/userStatSchema");
const { userStatQueue } = require("../index");

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
    updateCardsEntered(userIDs) {
        userIDs.forEach(async (userID) => {
            const statModel = await this.getUserStatModel(userID);
            statModel.cardsEntered += 1;
        });
    }

    // matchesCompeted
    // matchesWon
    // tiesLost
    // tiesWon
    async updateMatchesCompeted(userID, win, tie) {
        const statModel = await this.getUserStatModel(userID);
        if (win) {
            statModel.matchesWon += 1;
            if (tie) {
                statModel.tiesWon += 1;
            }
        } else if (tie) {
            statModel.tiesLost += 1;
        }
        statModel.matchesCompeted += 1;
    }

    // honorableMentions
    async updateMentions(userID) {
        const statModel = await this.getUserStatModel(userID);
        statModel.honorableMentions += 1;
    }

    // wins
    async updateWin(userID) {
        const statModel = await this.getUserStatModel(userID);
        statModel.wins += 1;
    }

    // matchesJudged
    // votesGiven
    async updateVotesGiven(userID, votes) {
        const statModel = await this.getUserStatModel(userID);
        statModel.matchesJudged += 1;
        statModel.votesGiven += votes;
    }

    // votesReceived
    // votesHighest
    async updateVotesReceived(userID, votes) {
        const statModel = await this.getUserStatModel(userID);
        statModel.votesReceived += votes;
        if (votes > statModel.votesHighest) {
            statModel.votesHighest += votes;
        }
    }

    // Save the user stats progress to persistent storage
    async saveProgress() {
        const task = async () => {
            for (const model of Object.values(this.userStatModels)) {
                await model.save();
            }
        };
        await userStatQueue.enqueue(task);
    }
}

module.exports = UserStatHelper;
