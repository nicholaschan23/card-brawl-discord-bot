const UserStatModel = require("../data/schemas/userStatSchema");

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
                if (!statModel) {
                    console.log("not in database");
                    // User stats doesn't exist, create one
                    statModel = new UserStatModel({
                        userID: userID,
                        cardsEntered: 0,

                        matchesCompeted: 0,
                        matchesWon: 0,
                        tiesLost: 0,
                        tiesWon: 0,
                        wins: 0,

                        matchesJudged: 0,
                        votesGiven: 0,
                        votesReceived: 0,
                        votesHighest: 0,
                    });
                }
                this.userStatModels[userID] = statModel;
            }
            return statModel;
        } catch (error) {
            console.log("Error receiving or creating user stats model:", error);
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
        for (const model of Object.values(this.userStatModels)) {
            await model.save();
        }
    }
}

module.exports = UserStatHelper;
