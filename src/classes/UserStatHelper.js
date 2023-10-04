const UserStatModel = require("../data/schemas/userStatSchema");

class UserStatHelper {
    constructor() {}

    async getUserStatModel(userID) {
        try {
            // Check if name already exists in dictionary
            const statModel = await UserStatModel.findOne({ userID }).exec();
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
            return statModel;
        } catch (error) {
            console.log("Error receiving or creating user stats model:", error);
            return;
        }
    }

    // cardsEntered
    updateCardsEntered(userIDs) {
        console.log("cards entered");
        userIDs.forEach(async (userID) => {
            const statModel = await this.getUserStatModel(userID);
            statModel.cardsEntered += 1;
            await statModel.save();
        });
    }

    // matchesCompeted
    // matchesWon
    // tiesLost
    // tiesWon
    async updateMatchesCompeted(userID, win, tie) {
        console.log("matches completed");

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
        await statModel.save();
    }

    // wins
    async updateWin(userID) {
        console.log("wins");

        const statModel = await this.getUserStatModel(userID);
        statModel.wins += 1;
        await statModel.save();
    }

    // matchesJudged
    // votesGiven
    async updateVotesGiven(userID, votes) {
        console.log("votes given");

        const statModel = await this.getUserStatModel(userID);
        statModel.matchesJudged += 1;
        statModel.votesGiven += votes;
        await statModel.save();
    }

    // votesReceived
    // votesHighest
    async updateVotesReceived(userID, votes) {
        console.log("votes received");

        const statModel = await this.getUserStatModel(userID);
        statModel.votesReceived += votes;
        if (votes > statModel.votesHighest) {
            statModel.votesHighest += votes;
        }
        await statModel.save();
    }

    // Save the user stats progress to persistent storage
    async saveProgress() {
        // console.log("saving")
        // for (const schema of Object.values(this.statModels)) {
        //     await schema.save();
        // }
        // console.log("saving...");
        // console.log(Object.values(this.statModels));
        // await UserStatModel.insertMany(Object.values(this.statModels), {
        //     upsert: true,
        // });
    }
}

module.exports = UserStatHelper;
